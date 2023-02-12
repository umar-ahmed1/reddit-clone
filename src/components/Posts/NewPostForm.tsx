import { Alert, AlertDescription, AlertIcon, AlertTitle, Flex, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import {BiPoll} from 'react-icons/bi'
import { BsLink45Deg,BsMic } from 'react-icons/bs';
import { IoDocumentText ,IoImageOutline } from 'react-icons/io5';
import {AiFillCloseCircle} from 'react-icons/ai'
import TabItem from './TabItem';
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Post } from '@/src/atoms/postsAtom';
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '@/src/firebase/clientApp';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

type NewPostFormProps = {
    user: User
};

const formTabs: TabItemType[] = [
    {
        title:'Post',
        icon: IoDocumentText
    },
    {
        title:'Images & Video',
        icon: IoImageOutline
    },
    {
        title:'Link',
        icon: BsLink45Deg
    },
    {
        title:'Poll',
        icon: BiPoll
    },
    {
        title:'Talk',
        icon:BsMic
    }

]

export type TabItemType = {
    title:string;
    icon:typeof Icon.arguments;
}

const NewPostForm:React.FC<NewPostFormProps> = ({user}) => {
    const router = useRouter()
    const [selectedTab,setSelectedTab] = React.useState(formTabs[0].title)
    const [textInputs,setTextInputs] = React.useState({
        title:'',
        body:''
    })
    const [selectedFile,setSelectedFile] = React.useState<string>()
    const [loading,setLoading] = React.useState(false)
    const [error,setError] = React.useState(false)

    const handleCreatePost = async () => {
        const {communityId} = router.query
        //create new post
        const newPost: Post = {
            communityId: communityId as string,
            creatorId: user.uid,
            creatorDisplayName: user.email!.split('@')[0],
            title: textInputs.title,
            body: textInputs.body,
            numberOfComments: 0,
            voteStatus: 0,
            createdAt: serverTimestamp() as Timestamp,
        }
        //store post in db
        setLoading(true)
        try {
            //create the post and add it to the posts collection
            const postDocRef = await addDoc(collection(firestore,'posts'),newPost)
            //check for selectedFile
            if (selectedFile){
                const imageRef = ref(storage,`posts/${postDocRef.id}/image`) //create ref for where to store image - in the post with id given 
                //store in storage (not firestore but the storage) then we can just add the place it is in the storage to the post
                await uploadString(imageRef,selectedFile,'data_url') //upload selectedFile in imageRef as type data_url
                //get the image url
                const downloadURL = await getDownloadURL(imageRef) 
                //add the image url to the post in the collection of posts
                await updateDoc(postDocRef,{
                    imageURL: downloadURL,
                })
            }
            
            //redirect user back to community page
            router.back()
        } catch (error: any) {
            console.log('handleCreatePost error',error.message)
            setError(true)
        }
        setLoading(false)
    }


    //select the image
    const onSelectImage = (event:React.ChangeEvent<HTMLInputElement>) => {
        //create a file reader
        const reader = new FileReader()
        //see if there are any files (there cud be many files so this is an array)
        if (event.target.files?.[0]){
            reader.readAsDataURL(event.target.files[0]) //FileReader reads the file
            reader.onload = (readerEvent) => {     //onload triggers once the readasdataURL completes
                if (readerEvent.target?.result){    //if there was a result
                    setSelectedFile(readerEvent.target.result as string) //set the selected file
                }
            }   
        }
    }

    //fill the text form
    const onTextChange = (event:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {
            target:{name,value},
        } = event
        setTextInputs((prev) => ({
            ...prev,
            [name]: value,
        }))
    }
    
    return (
        <Flex direction='column' bg='white' borderRadius={4} mt={2}>
            <Flex width='100%'>
                {formTabs.map((item) => (
                    <TabItem key={item.title} item={item} selected={item.title === selectedTab} setSelectedTab={setSelectedTab}/>
                ))}
            </Flex>
            <Flex p={4}>
                {selectedTab === 'Post' && <TextInputs
                    textInputs={textInputs}
                    handleCreatePost={handleCreatePost}
                    onChange={onTextChange}
                    loading={loading}
                />}
                {selectedTab === 'Images & Video' && <ImageUpload
                    selectedFile={selectedFile}
                    onSelectImage={onSelectImage}
                    setSelectedTab={setSelectedTab}
                    setSelectedFile={setSelectedFile}
                />}
            </Flex>
            {error && (
                <Alert status='error'>
                    <AlertIcon />
                    <Text mr={2}>Error creating post</Text>
                </Alert>    
            )}
        </Flex>
    )
}
export default NewPostForm;