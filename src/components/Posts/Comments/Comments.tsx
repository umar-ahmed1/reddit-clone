import { Post, postState } from '@/src/atoms/postsAtom';
import { firestore } from '@/src/firebase/clientApp';
import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text} from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, doc, getDocs, increment, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import CommentInput from './CommentInput';
import CommentItem, {Comment} from './CommentItem'

type CommentsProps = {
    user?: User | null
    selectedPost: Post | null
    communityId: string
};

const Comments:React.FC<CommentsProps> = ({user,selectedPost,communityId}) => {
    const [commentText,setCommentText] = React.useState('')
    const [comments,setComments] = React.useState<Comment[]>([])
    const [fetchLoading, setFetchLoading] = React.useState(true)
    const [createLoading, setCreateLoading] = React.useState(false)
    const [loadingDeleteId,setLoadingDeleteId] = React.useState('')
    const setPostState = useSetRecoilState(postState)

    const onCreateComment = async (commentText: string) => {
        //create a comment document
        try {
            setCreateLoading(true)
            const batch = writeBatch(firestore)
            const commentDocRef=doc(collection(firestore,'comments'))

            const newComment: Comment = {
                id:commentDocRef.id,
                creatorId: user!.uid,
                creatorDisplayText: user!.email!.split('@')[0],
                communityId,
                postId: selectedPost?.id!,
                postTitle: selectedPost?.title!,
                text:commentText,
                createdAt: serverTimestamp() as Timestamp,
            }
            
            batch.set(commentDocRef,newComment)

            newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp
            //update the numberofcomments on the post
            const postDocRef = doc(firestore,'posts',selectedPost?.id!)            
            batch.update(postDocRef,{
                numberOfComments: increment(1)
            })
            await batch.commit()
            //update recoil state
            setCommentText('')
            setComments(prev => [newComment,...prev])
            setPostState(prev => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost!.numberOfComments + 1
                } as Post    
            }))
            setCreateLoading(false)

        } catch(error:any){
            console.log('oncreatrecomment error',error.message)
        }

    }

    const onDeleteComment = async (comment: Comment) => {
        setLoadingDeleteId(comment.id)
        //create a comment document
        try {
            //delete doc
            const batch = writeBatch(firestore)
            const commentDocRef = doc(firestore,'comments',comment.id)
            batch.delete(commentDocRef)
            //decrement numberofcomments by 1 on post
            const postDocRef = doc(firestore,'posts',selectedPost?.id!)
            batch.update(postDocRef,{
                numberOfComments: increment(-1)
            })
            await batch.commit()
            //update state
            setPostState((prev) => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! -1
                } as Post
            }))
            
            setComments(prev => prev.filter(item => item.id !== comment.id))
        
        } catch (error:any){
            console.log('ondeletecomment error',error.message)
        }
        setLoadingDeleteId('')  
    }

    const getPostComments = async () => {
        try{
            const commentsQuery = query(collection(firestore,'comments'),
            where('postId', '==',selectedPost?.id),
            orderBy('createdAt','desc')
            )
            const commentDocs = await getDocs(commentsQuery)
            const comments = commentDocs.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setComments(comments as Comment[]) 
        }catch(error:any){
            console.log('getpostcomments error',error.message)
        }
        setFetchLoading(false)
    }

    React.useEffect(()=> {
        if(!selectedPost) return
        getPostComments()
    },[selectedPost])

    return (
        <Box bg='white' borderRadius='0px 0px 4px 4px' p={2}>
            <Flex direction='column' pl={10} pr={4} mb={6} fontSize='10pt' width='100%'>
                {!fetchLoading && (<CommentInput 
                    commentText={commentText} 
                    setCommentText={setCommentText} 
                    user={user!} 
                    createLoading={createLoading} 
                    onCreateComment={onCreateComment}
                />)}
            </Flex>
            <Stack spacing={6} p={2}>
                {fetchLoading ? (
                    <>
                        {[0,1,2].map((item) => (
                            <Box key={item} padding='6' bg='white'>
                                <SkeletonCircle size='10'/>
                                <SkeletonText mt='4' noOfLines={2} spacing='4'/>
                            </Box>
                        ))}
                    </>
                ) : (
                  <>
                    {comments.length === 0 ? (
                        <Flex direction='column' justify='center' align='center' borderTop='1px solid' borderColor='gray.100' p={20}>
                            <Text fontWeight={700} opacity={0.3}>No Comments Yet</Text>
                        </Flex>
                    ) : (
                        <>
                            {comments.map(comment =>(
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onDeleteComment={onDeleteComment}
                                    loadingDelete={loadingDeleteId === comment.id}
                                    userId={user!.uid}
                                />
                            ) 
                            )}
                        </>
                    )}
                  </>  
                )}

            </Stack>
        </Box>
    )
}
export default Comments;