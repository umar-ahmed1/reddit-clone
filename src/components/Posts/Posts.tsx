import { Community } from '@/src/atoms/communitiesAtom';
import { Post } from '@/src/atoms/postsAtom';
import { auth, firestore } from '@/src/firebase/clientApp';
import usePosts from '@/src/hooks/usePosts';
import { Stack } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from './PostItem';
import PostLoader from './PostLoader';

type PostsProps = {
    communityData: Community
};

const Posts:React.FC<PostsProps> = ({communityData}) => {
    const [user] = useAuthState(auth)
    const [loading,setLoading] = React.useState(false)
    const {postStateValue,setPostStateValue,onVote,onDeletePost,onSelectPost} = usePosts()

    const getPosts = async () => {
        try{
            setLoading(true)
            //create ref to all posts but from where? - all posts where communityId = communityData.id and sort by descending createdAt
            //to do queries tho u need to make indexes so do that from the error msg u get in the console
            const postsQuery = query(collection(firestore,'posts'),
            where('communityId','==',communityData.id),
            orderBy('createdAt','desc')
            )
            //actualyl get the posts now
            const postDocs = await getDocs(postsQuery)
            //store posts in a variable
            const posts = postDocs.docs.map((doc) => ({id: doc.id, ...doc.data()}))
            //store them in state
            setPostStateValue((prev) => ({
                ...prev,
                posts: posts as Post[],
            }))
            console.log('state',postStateValue)
            setLoading(false)
        } catch(error:any){
            console.log('getPosts error',error.message)
        }


    }
    //when a page loads get all the posts
    React.useEffect(() => {
        getPosts()
    },[communityData])
    
    return (
        <>
        {loading ? (
            <PostLoader/>
        ) : (
            <Stack>
                {postStateValue.posts.map(item => 
                <PostItem
                    key={item.id}
                    post={item}
                    userIsCreator={user?.uid === item.creatorId}
                    userVoteValue={postStateValue.postVotes.find(vote => vote.postId === item.id)?.voteValue}
                    onVote={onVote}
                    onSelectPost={onSelectPost}
                    onDeletePost={onDeletePost}
                />)}
            </Stack>
        )}
        
        </>
    )
}
export default Posts;