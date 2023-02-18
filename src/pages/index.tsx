import { Stack } from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import { communityState } from "../atoms/communitiesAtom";
import { Post, PostVote } from "../atoms/postsAtom";
import CreatePostLink from "../components/Community/CreatePostLink";
import PersonalHome from "../components/Community/PersonalHome";
import Premium from "../components/Community/Premium";
import Recommendations from "../components/Community/Recommendations";
import PageContent from "../components/Layout/PageContent";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import useCommunityData from "../hooks/useCommunityData";
import usePosts from "../hooks/usePosts";

export default function Home() {
  const [user, loadingUser] = useAuthState(auth)
  const [loading,setLoading] = React.useState(false)
  const {postStateValue,setPostStateValue,onSelectPost,onDeletePost,onVote} = usePosts()
  const {communityStateValue} = useCommunityData()
  //if there is a logged in user show posts from communities they have joined
  const buildUserHomeFeed = async () => {
    setLoading(true)
    try {
      if (communityStateValue.mySnippets.length){
        //create an array of all the community ids of the communities the user is in had to splice it cuz max 10 communities allowed sad :(
        const myCommunityIds = communityStateValue.mySnippets.map(snippet => snippet.communityId).splice(0,9)
        //only get the posts of communities which the user is in
        const postQuery = query(collection(firestore,'posts'),
        limit(10),
        where('communityId','in',myCommunityIds),
        )
        const postDocs = await getDocs(postQuery)
        let posts = postDocs.docs.map(doc => ({id: doc.id, ...doc.data()}))
        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[]
        }))
        //if they are in no communities treat it as no communities
      } else {
        buildNoUserHomeFeed()
      }

    } catch (error:any) {
        console.log('builduserhomefeed error',error.message)
    }
    setLoading(false)
  }

  //if theres no logged in users show 10 most popular posts
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

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map(post => post.id)
      const postVotesQuery = query(collection(firestore,`users/${user?.uid}/postVotes`),where('postId','in',postIds))
      const postVoteDocs = await getDocs(postVotesQuery)
      const postVotes = postVoteDocs.docs.map(doc => ({id: doc.id, ...doc.data()}))
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[]
      }))
    } catch (error:any) {
        console.log('getuserpostvotes error',error.message)
    }
  }

  //get the user post votes if the user is logged in adn the posts have been didsplayed
  React.useEffect(() => {
    if (user && postStateValue.posts.length){
      getUserPostVotes()
    }
    //cleanup function when the component dismounts
    return () => {
      setPostStateValue(prev => ({
        ...prev,
        postVotes: [],
      }))
    }
  },[user,postStateValue.posts])

  React.useEffect(() => {
    //if no user and if its not attempting to get a user
    if (!user && !loadingUser){
      buildNoUserHomeFeed()
      return
    } 

  },[user,loadingUser])

  //when all the communities the user is in has been fetched then we can build their home page
  React.useEffect(() => {
    if(communityStateValue.snippetsFetched){
      buildUserHomeFeed()
    }
  },[communityStateValue.snippetsFetched])


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
      <Stack spacing={5}>
        <Recommendations/>
        <Premium/>
        <PersonalHome/>
      </Stack>
    </PageContent>
  )
}
