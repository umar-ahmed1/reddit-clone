import React from 'react';
import { authModalState } from '../../../atoms/authModalAtom';
import { useRecoilState} from 'recoil'
import { Flex } from '@chakra-ui/react';
import Login from './Login'
import SignUp from './SignUp'


type AuthInputsProps = {
    
};

const AuthInputs:React.FC<AuthInputsProps> = () => {
    const [modalState,setModalState] = useRecoilState(authModalState)

    return (
        <Flex direction='column' align='center' width='100%' mt={4}>
            {modalState.view === 'login' && <Login/>}
            {modalState.view === 'signup' && <SignUp/>}
        </Flex>

    )
}
export default AuthInputs;