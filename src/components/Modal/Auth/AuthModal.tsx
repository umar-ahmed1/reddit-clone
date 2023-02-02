import { authModalState } from '../../../atoms/authModalAtom';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Flex, Text} from '@chakra-ui/react';
import React from 'react';
import { useRecoilState} from 'recoil'
import AuthInputs from './AuthInputs';
import OAuthButtons from './OAuthButtons';
import {auth} from '../../../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth';
import ResetPassword from './ResetPassword'; 

const AuthModal: React.FC = () => {
    const [modalState,setModalState] = useRecoilState(authModalState)
    const [user,loading,error] = useAuthState(auth) //we can close the modal if theres a logged in user

    const handleClose = () => {
        setModalState(prev => ({
            ...prev,
            open: false,
        }))
    }

    //only close the modal when user variable changes
    React.useEffect(()=>{
        if(user) handleClose()
    },[user])

    return (
        <>
            <Modal isOpen={modalState.open} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign='center'>
                        {modalState.view === 'login' && 'Login'}
                        {modalState.view === 'signup' && 'Sign Up'}
                        {modalState.view === 'resetPassword' && 'Reset Password'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' flexDirection='column' alignItems='center' justifyContent='center' pb={6}>
                        <Flex direction='column' align='center' justify='center' width='70%'>

                            {modalState.view === 'login' || modalState.view === 'signup' 
                                ? (
                                    <>
                                    <OAuthButtons/>
                                    <Text color='gray.400' fontWeight='700'>OR</Text>
                                    <AuthInputs/>
                                    </>   
                                )
                                : (
                                    <ResetPassword/>
                                )
                                    
                            }
                        </Flex>
                    </ModalBody>


                </ModalContent>
            </Modal>
        </>
    )
}
export default AuthModal;
