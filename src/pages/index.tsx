import { Stack } from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Post } from "../atoms/postsAtom";
import CreatePostLink from "../components/Community/CreatePostLink";
import PageContent from "../components/Layout/PageContent";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import usePosts from "../hooks/usePosts";

export default function Home() {
  const [user, loadingUser] = useAuthState(auth)
  const [loading,setLoading] = React.useState(false)
  const {postStateValue,setPostStateValue,onSelectPost,onDeletePost,onVote} = usePosts()
  const buildUserHomeFeed = () => {

  }

  const buildNoUserHomeFeed = async () => {
    setLoading(true)
    try {
      //get 10 most popular posts
      const postQuery = query(collection(firestore,'posts'),orderBy('voteStatus','desc'),limit(10))
      const postDocs = await getDocs(postQuery)
      const posts = postDocs.docs.map(doc => ({id:doc.id, ...doc.data() }))
      //setPostState
      setPostStateValue(prev => ({
        ...prev,
        posts: posts as Post[]
      }))

    } catch (error:any) {
      console.log('buildnouserhomefeederror',error.message)
    }
    setLoading(false)
  }

  const getUserPostVotes = () => {

  }

  React.useEffect(() => {
    //if no user and if its not attempting to get a user
    if (!user && !loadingUser){
      buildNoUserHomeFeed()
      return
    } 

  },[user,loadingUser])

  return (
    <PageContent>
      <>
      <CreatePostLink/>
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
                    homePage = {true}
                />)}
            </Stack>
        )}
      </>
      <>

      </>
    </PageContent>
  )
}
