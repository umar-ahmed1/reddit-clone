import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React from 'react';
import { useRecoilState } from 'recoil';
import { Post, postState } from '../atoms/postsAtom';
import { firestore, storage } from '../firebase/clientApp';


const usePosts = () => {
    const [postStateValue,setPostStateValue] = useRecoilState(postState)


    //when you vote on post
    const onVote = async () => {

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
            const postDocRef = doc(firestore,'posts',post.id)
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


    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost
    }
}
export default usePosts;