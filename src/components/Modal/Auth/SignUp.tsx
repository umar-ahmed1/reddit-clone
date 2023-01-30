import React from 'react';
import { Button, Flex, Input, Text } from '@chakra-ui/react';
import { authModalState } from '../../../atoms/authModalAtom';
import {useSetRecoilState} from 'recoil'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
//get our firebase auth
import {auth} from '../../../firebase/clientApp'
import {FIREBASE_ERRORS} from '../../../firebase/errors'


type SignUpProps = {
    
};

const SignUp:React.FC<SignUpProps> = () => {
    
    const setAuthModalState = useSetRecoilState(authModalState)

    const [signUpForm,setSignUpForm] = React.useState({
        email:'',
        password:'',
        confirmPassword:'',
    })

    const [
        createUserWithEmailAndPassword,
        user,
        loading,
        userError,
      ] = useCreateUserWithEmailAndPassword(auth);

    const [error,setError] = React.useState('')

    const onSubmit= (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault() //prevent refresh
        if(error) setError('') //reset the error
        if(signUpForm.password !== signUpForm.confirmPassword){
            //set the error message and return
            setError('Passwords do not match')
            return
        }
        //create the account
        createUserWithEmailAndPassword(signUpForm.email,signUpForm.password)
    }



    
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSignUpForm(prev => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }


    return (
        <form onSubmit={onSubmit}>
            <Input
                required
                name='email' 
                placeholder='email' 
                type='email' 
                mb={2} 
                onChange={onChange}
                fontSize='10pt' 
                _placeholder={{color:'gray.500'}}
                _hover={{
                    bg:'white',
                    border:'1px solid',
                    borderColor:'blue.500',
                }}
                _focus={{
                    outline:'none',
                    bg:'white',
                    border:'1px solid',
                    borderColor:'blue.500',
                }}
                bg='gray.50'
            />
            <Input
                required
                name='password' 
                placeholder='password' 
                type='password' 
                mb={2} 
                onChange={onChange}
                fontSize='10pt' 
                _placeholder={{color:'gray.500'}}
                _hover={{
                    bg:'white',
                    border:'1px solid',
                    borderColor:'blue.500',
                }}
                _focus={{
                    outline:'none',
                    bg:'white',
                    border:'1px solid',
                    borderColor:'blue.500',
                }}
                bg='gray.50'  
            />
            <Input
                required
                name='confirmPassword' 
                placeholder='confirm password' 
                type='password' 
                mb={2} 
                onChange={onChange}
                fontSize='10pt' 
                _placeholder={{color:'gray.500'}}
                _hover={{
                    bg:'white',
                    border:'1px solid',
                    borderColor:'blue.500',
                }}
                _focus={{
                    outline:'none',
                    bg:'white',
                    border:'1px solid',
                    borderColor:'blue.500',
                }}
                bg='gray.50'  
            />
            {(error || userError) && (
                    <Text fontSize='10pt' textAlign='center' color='red'>
                        {error || 
                            FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS]}
                    </Text>
                    )}
            <Button 
                width='100%' 
                height='36px' 
                mt={2} 
                mb={2} 
                type='submit' 
                isLoading={loading}
            >
                Sign Up
            </Button>
            <Flex fontSize='9pt' justifyContent='center'>
                <Text mr={1}>Already a redditor?</Text>
                <Text 
                    color='blue.500' 
                    fontWeight={700} 
                    cursor='pointer' 
                    onClick={()=> setAuthModalState((prev) => ({
                        ...prev,
                        view:'login',
                    }))
                    }
                >
                LOG IN
                </Text>
            </Flex>
        </form>
    )
}
export default SignUp;