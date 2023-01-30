import { Button, Flex } from '@chakra-ui/react';
import React from 'react';
import AuthModal from '../../Modal/Auth/AuthModal';
import AuthButtons from './AuthButtons';
import { useSignOut } from 'react-firebase-hooks/auth';
import {auth} from '../../../firebase/clientApp'

type RightContentProps = {
    user: any;
};

const RightContent:React.FC<RightContentProps> = ({user}) => {
    const [signOut, loading, error] = useSignOut(auth);
    return (
        <>
        <AuthModal/>
        <Flex justify='center' align='center'>
            {user 
                ? 
                <Button onClick={() => signOut()}>Log Out</Button> 
                : 
                <AuthButtons/>
            }
            
        </Flex>
        </>
    )
}
export default RightContent;