import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { communityState } from '../atoms/communitiesAtom';
import { Post, postState, PostVote } from '../atoms/postsAtom';
import { auth, firestore, storage } from '../firebase/clientApp';


const usePosts = () => {
    const [postStateValue,setPostStateValue] = useRecoilState(postState)
    const [user] = useAuthState(auth)
    const currentCommunity = useRecoilValue(communityState).currentCommunity
    const setAuthModalState = useSetRecoilState(authModalState)

    //when you vote on post
    const onVote = async (post: Post, vote: number, communityId: string) => {
        //check for a user if not then open the authmodal
        if (!user?.uid){
            setAuthModalState({open:true,view:'login'})
            return
        }

        try{
            const {voteStatus} = post;
            //check all the posts the user has voted on and see if any of them are this post
            const existingVote = postStateValue.postVotes.find(vote => vote.postId === post.id)

            const batch = writeBatch(firestore)
            //copies of current values of state - we will modify these and then use them to update state
            //this is very common and ensures u avoid mutating state directly to avoid unwanted side effects
            const updatedPost = {...post}
            const updatedPosts = [...postStateValue.posts]
            let updatedPostVotes = [...postStateValue.postVotes]
            console.log(updatedPostVotes)
            //amount to modify things
            let voteChange = vote;

            //they havent voted on the post before (neutral -> upvote || neutral -> downvote)
            if (!existingVote) {
                //create a new postvote document to the post in the place where all the posts the user has voted on is stored
                const postVoteRef = doc(collection(firestore, 'users',`${user?.uid}/postVotes` ))
                //create the vote with all the data
                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote
                }
                //do the batch write (remember batch tries to do everything or nothing)
                batch.set(postVoteRef,newVote)

                //add or subtract 1 to/from post.voteStatus remember vote is +1 or -1 
                updatedPost.voteStatus = voteStatus + vote;
                //add vote to postVoteState - remember postVotes is all the posts u voted on
                updatedPostVotes = [...updatedPostVotes, newVote]
            }
            //they have voted on the post before so change their vote or remove their vote
            else {
                //ref to document that does already exist
                const postVoteRef= doc(firestore,'users',`${user?.uid}/postVotes/${existingVote.id}`)
                //user removing their vote (upvote -> neutral || downvote -> neutral )
                if (existingVote.voteValue === vote){
                    updatedPost.voteStatus = voteStatus - vote;
                    //remove the post from all the posts the user has voted on
                    updatedPostVotes = updatedPostVotes.filter(vote => vote.id !== existingVote.id)
                    //delete the postvote document
                    batch.delete(postVoteRef)

                    voteChange *= -1
                }
                //user changing their vote (up -> down || down -> up)
                else {
                    //add/subtract 2 from post.voteStatus (if it has 5 upvotes and one of them is u then when u change to downvote it gets rid of an upvote and adds a downvote)
                    updatedPost.voteStatus = voteStatus + (2 * vote)
                    //update the postVote array - we need to find the vote in postvotes array and modify it so we need its index
                    const voteIndex = postStateValue.postVotes.findIndex(vote => vote.id === existingVote.id)
                    //update the array now
                    updatedPostVotes[voteIndex] = {
                        ...existingVote,
                        voteValue: vote,
                    }

                    //update the actual document now
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    })

                    voteChange = 2 * vote;
                }
        }

        //update our post document since the total votes on the post changed
        const postRef = doc(firestore,'posts',post.id!)
        batch.update(postRef, {
            voteStatus: voteStatus + voteChange
        })
        
        //execute all the batch operations but if any fail execute nothing
        await batch.commit()
        
        //update our front end recoil state first find the post in posts and change it to the modified post
        const postIndex = postStateValue.posts.findIndex(item => item.id === post.id)
        updatedPosts[postIndex] = updatedPost
        //set the state 
        setPostStateValue(prev => ({
            ...prev,
            posts: updatedPosts,
            postVotes: updatedPostVotes,
        }))
        

        console.log(postStateValue)

        } catch (error: any){
            console.log('onVote error',error.message)
        }

    }

    //when you select a post
    const onSelectPost = () => {

    }

    //when you delete a post
    const onDeletePost = async (post : Post): Promise<boolean> => {
        try {
            //check if image, delete if exists
            if (post.imageURL){
                const imageRef = ref(storage,`posts/${post.id}/image`)
                await deleteObject(imageRef)
            }
            //delete post doc
            const postDocRef = doc(firestore,'posts',post.id!)
            await deleteDoc(postDocRef)
            //update state
            setPostStateValue(prev => ({
                ...prev,
                posts:prev.posts.filter(item => item.id !== post.id)
            }))

        } catch (error: any){
            console.log('onDeletePost error', error.message)
        }
        return true
    }

    const getCommunityPostVotes = async (communityId: string) => {
        //get all the posts the user has voted on but only in that community
        const postVotesQuery = query(collection(firestore,'users',`${user?.uid}/postVotes`),where('communityId', '==', communityId))
        const postVoteDocs = await getDocs(postVotesQuery)
        console.log(postVoteDocs)
        const postVotes = postVoteDocs.docs.map(doc => ({id: doc.id, ...doc.data()}))
        setPostStateValue(prev => ({
            ...prev,
            postVotes: postVotes as PostVote[]
        }))
    }

    //call this function to get all the posts everytime a user opens a community page or a user logs in and theres a page
    React.useEffect(() => {
        if (!currentCommunity?.id || !user) return
        getCommunityPostVotes(currentCommunity?.id)
    },[user,currentCommunity])

    //clear postVotes if no user
    React.useEffect(()=> {
        if(!user){
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: [],
            }))
        }
    },[user])

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost
    }
}
export default usePosts;