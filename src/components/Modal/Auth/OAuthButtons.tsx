import { Flex, Button, Image, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import React from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import {auth, firestore} from '../../../firebase/clientApp'

type OAuthButtonsProps = {
    
};

const OAuthButtons:React.FC<OAuthButtonsProps> = () => {
    const [signInWithGoogle,userCred,loading,error]= useSignInWithGoogle(auth)

    //store the user in firestore collections with their data - we use setDoc because for ex logging in with google cud be making an account or logging in
    //setdoc covers both cases we cant do adddoc
    const createUserDocument = async (user:User) => {
        const userDocRef = doc(firestore,'users',user.uid)
        await setDoc(userDocRef,user)
    }

    //everytime usercredentials change (a user is made or logged in) then run create user
    React.useEffect(()=>{
        if(userCred){
            createUserDocument(JSON.parse(JSON.stringify(userCred.user)))
        }
    },[userCred])


    return (
        <Flex direction="column" width="100%" mb={4}>
            <Button variant={"oauth"} mb={2} isLoading={loading} onClick={() => signInWithGoogle()}>
                <Image height="20px" src="/images/googlelogo.png" mr={4}></Image>
                Continue with Google
            </Button>
            {error && <Text>{error.message}</Text>}

        </Flex>

    )
}
export default OAuthButtons;