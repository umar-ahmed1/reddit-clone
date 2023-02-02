import { Button, Flex,} from '@chakra-ui/react';
import React from 'react';
import AuthModal from '../../Modal/Auth/AuthModal';
import AuthButtons from './AuthButtons';
import { useSignOut } from 'react-firebase-hooks/auth';
import {auth} from '../../../firebase/clientApp'
import { User } from 'firebase/auth';
import Icons from './Icons';
import UserMenu from './UserMenu';

type RightContentProps = {
    user?: User | null; //undefined is the ? and null is null and user is user so we cover all three
};

const RightContent:React.FC<RightContentProps> = ({user}) => {
    return (
        <>
        <AuthModal/>
        <Flex justify='center' align='center'>
            {user 
                ? 
                <Icons/>
                : 
                <AuthButtons/>
            }
            <UserMenu user={user}/>
            
        </Flex>
        </>
    )
}
export default RightContent;