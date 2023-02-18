import useDirectory from '@/src/hooks/useDirectory';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,Box, Divider,Text, Input, Stack, Checkbox, Flex, Icon } from '@chakra-ui/react';
import { addDoc, doc, Firestore, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BsFillPersonFill, BsFillEyeFill } from 'react-icons/bs';
import {HiLockClosed} from 'react-icons/hi';
import {auth, firestore} from '../../../firebase/clientApp'

type CreateCommunityModalProps = {
    open:boolean;
    handleClose: () => void;
};

const CreateCommunityModal:React.FC<CreateCommunityModalProps> = ({open,handleClose}) => {
    const [user] = useAuthState(auth)
    const [communityName,setCommunityName] = React.useState('')
    const [charsRemaining,setCharsRemaining] = React.useState(21)
    const [communityType,setCommunityType] = React.useState('public')
    const [error,setError] = React.useState('')
    const [loading,setLoading] = React.useState(false)
    const router = useRouter()
    const {toggleMenuOpen} = useDirectory()
    

    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 21) {
            return
        }
        setCommunityName(event.target.value)
        setCharsRemaining(21 - event.target.value.length)
    }

    const onCommunityTypeChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        setCommunityType(event.target.name)
    }

    const handleCreateCommunity = async () => {
        if(error) setError('')
        //Validate the community name (not taken, valid, between 3-21 characters, etc)
        var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if(format.test(communityName) || communityName.length < 3){//check if any of those characters in format in community name or less 3 characters
            setError(
                "Community names must be between 3-21 characters, and can only contain letters, numbers, or underscores"
            )
            return
        }


        //while its waiting to find and set the doc we show a loading symbol 
        setLoading(true) 
        
        try {
            //create a reference to the doc //function takes the firestore and the collection and the id of the specific item in the collection
            const communityDocRef = doc(firestore, 'communities',communityName)
            
            //if we create a community we want the user who made it to join the community too, so if either one of those fail we want the other to fail too
            //basically both happen or none happen so we use transactions from firebase to do so
            await runTransaction(firestore, async(transaction) => {
                const communityDoc = await transaction.get(communityDocRef) //actually get the doc so we can see if it exists or not - originally we used getDoc but now we do transaction.get
                //if a community with that name exists then set error
                if (communityDoc.exists()){
                    throw new Error(`Sorry r/${communityName} is taken. Try another.`)
                    }

                //Create the community
                //setDoc will update existing document or create a new one it uses the object given to it and stores it - now transaction.set so its part of the transaction
                transaction.set(communityDocRef,{
                    creatorId: user?.uid,
                    createdAt: serverTimestamp(),
                    numberOfMembers: 1,
                    privacyType: communityType,
                })     

                //create community on the user data in the sub collections (we need to give the absolute path to the user)
                //so in the subcollections of the user theres one called communitySnippets and that has the community name with the data of id and ismoderator
                transaction.set(
                    doc(firestore, `users/${user?.uid}/communitySnippets`, communityName),
                    {
                      communityId: communityName,
                      isModerator: true,
                    }
                  );
                })
                router.push(`r/${communityName}`)
                handleClose()
                toggleMenuOpen()
        } catch (error: any) {
            console.log('handleCreateCommunityerror', error)
            setError(error.message)
        }
        //Loading is done now
        setLoading(false)
    }

    return (
        <>
          <Modal isOpen={open} onClose={handleClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader display='flex' flexDirection='column' fontSize={15} padding={3}>Create a community</ModalHeader>
              <Box pl={3} pr={3}>
                <Divider/>
                <ModalCloseButton/>
                <ModalBody display='flex' flexDirection='column' padding='10px 10px'>
                    <Text fontWeight={600} fontSize={15}>Name</Text>
                    <Text fontSize={11} color='gray.500'>
                        Community names including capitalization cannot be changed
                    </Text>
                    <Text position='relative' top='28px' left='10px' width='20px' color='gray.400'>r/</Text>
                    <Input position='relative' value={communityName} size='sm' pl='22px' onChange={handleChange}/>
                    <Text fontSize='9pt' color={charsRemaining === 0 ? 'red' : 'gray.500'}>{charsRemaining} Characters remaining</Text>
                    <Text fontSize='9pt' color='red' pt={1}>{error}</Text>
                    <Box mt={4} mb={4}>
                        <Text fontWeight={600} fontSize={15}>Community Type</Text>
                        <Stack spacing={2}>
                            <Checkbox 
                                name='public' 
                                isChecked={communityType==='public'} 
                                onChange={onCommunityTypeChange}
                            >   
                                <Flex align='center'>
                                    <Icon as={BsFillPersonFill} color='gray.500' mr={2}/>
                                    <Text fontSize='10pt' mr={1}>Public</Text>
                                    <Text fontSize='8pt' color='gray.500' >Anyone can view, post, and comment to this community</Text>
                                </Flex>
                            </Checkbox>
                            <Checkbox 
                                name='restricted' 
                                isChecked={communityType==='restricted'} 
                                onChange={onCommunityTypeChange}
                            >
                                <Flex align='center'>
                                    <Icon as={BsFillEyeFill} color='gray.500' mr={2}/>
                                    <Text fontSize='10pt' mr={1}>Restricted</Text>
                                    <Text fontSize='8pt' color='gray.500'>Anyone can view this community, but only approved users can post</Text>
                                </Flex>
                            </Checkbox>
                            <Checkbox 
                            name='private' 
                            isChecked={communityType==='private'} 
                            onChange={onCommunityTypeChange}
                            >
                               <Flex align='center'>
                                    <Icon as={HiLockClosed} color='gray.500' mr={2}/>
                                    <Text fontSize='10pt' mr={1}>Private</Text>
                                    <Text fontSize='8pt' color='gray.500' >Only approved users can view and submit to this community</Text>
                                </Flex>
                            </Checkbox>
                        </Stack>
                    </Box>



                </ModalBody>
              </Box>
            
              <ModalFooter bg='gray.100' borderRadius='0px 0px 10px 10px'>
                <Button variant='outline' height='30px' mr={3} onClick={handleClose}>
                  Cancel
                </Button>
                <Button height='30px' onClick={handleCreateCommunity} isLoading={loading}>Create Community</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}
export default CreateCommunityModal;

function collection(firestore: Firestore, arg1: string) {
    throw new Error('Function not implemented.');
}
