import { Post, postState } from '@/src/atoms/postsAtom';
import About from '@/src/components/Community/About';
import PageContent from '@/src/components/Layout/PageContent';
import Comments from '@/src/components/Posts/Comments/Comments';
import PostItem from '@/src/components/Posts/PostItem';
import { auth, firestore } from '@/src/firebase/clientApp';
import useCommunityData from '@/src/hooks/useCommunityData';
import usePosts from '@/src/hooks/usePosts';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';


const PostPage:React.FC = () => {
    const {postStateValue,setPostStateValue,onDeletePost,onVote} = usePosts()
    const {communityStateValue} = useCommunityData()
    const [user] = useAuthState(auth)
    const router = useRouter();
    //if the user is visiting directly from the link then query database grab post put it into state and load
    const fetchPost = async (postId : string) => {
        try{
            const postDocRef = doc(firestore,'posts',postId)
            const postDoc = await getDoc(postDocRef)
            setPostStateValue(prev => ({
                ...prev,
                selectedPost: {id: postDoc.id, ...postDoc.data()} as Post
            }))
        } catch (error : any){
            console.log('fetchPost error',console.log(error.message))
        }
    }

    React.useEffect(() => {
        const {pid} = router.query
        //if theres a postid but theres no selectedPost (so nothing loads then we fetch the post)
        if (pid && !postStateValue.selectedPost){
            fetchPost(pid as string)
        }
        //if logic depends on something then we have to add them as dependencies in the [] at hte end
    },[router.query,postStateValue.selectedPost])

    return (
        <PageContent>
            <>
            {postStateValue.selectedPost && (
            <PostItem 
                post={postStateValue.selectedPost} 
                onVote={onVote} 
                onDeletePost={onDeletePost} 
                userVoteValue={postStateValue.postVotes.find(item => item.postId === postStateValue.selectedPost?.id)?.voteValue}
                userIsCreator = {user?.uid === postStateValue.selectedPost?.creatorId}
            />)}
            <Comments user={user} selectedPost={postStateValue.selectedPost} communityId={postStateValue.selectedPost?.communityId as string}/>
            </>
            <>
            {communityStateValue.currentCommunity && <About communityData={communityStateValue.currentCommunity}/>}
            </>
        </PageContent>
    )
}
export default PostPage;