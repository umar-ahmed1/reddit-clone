import { ChevronDownIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, Button, MenuList, MenuItem, Icon, Flex,Text, MenuDivider } from '@chakra-ui/react';
import { signOut, User } from 'firebase/auth';
import React from 'react';

import {FaRedditSquare} from 'react-icons/fa'
import {VscAccount} from 'react-icons/vsc'
import {IoSparkles} from 'react-icons/io5'
import {CgProfile} from 'react-icons/cg'
import {MdOutlineLogin} from 'react-icons/md'
import {auth} from '../../../firebase/clientApp'
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { authModalState } from '@/src/atoms/authModalAtom';
import { communityState } from '@/src/atoms/communitiesAtom';

type UserMenuProps = {
    user?: User | null; //undefined is the ? and null is null and user is user so we cover all three
};

const UserMenu:React.FC<UserMenuProps> = ({user}) => {
    const resetCommunityState = useResetRecoilState(communityState)
    const setAuthModalState = useSetRecoilState(authModalState)

    const logout = async () => {
        await signOut(auth)
        resetCommunityState()
        //clear community state
        

    }
    
    return (
        <Menu>
            <MenuButton cursor='pointer' padding='0px 6px' borderRadius={4} _hover={{outline:'1px solid',outlineColor:'grey.200'}}>
                <Flex align='center'>
                    <Flex align='center'>                        
                {user ?
                    (
                        <>
                        <Icon fontSize={24} mr={1} color='gray.300' as={FaRedditSquare} />
                        <Flex
                            direction='column'
                            display ={{base:'none',lg:'flex'}}
                            fontSize='8pt'
                            align="flex-start"
                            mr={8}
                        >
                            <Text fontWeight={700}>
                                {user?.displayName || user.email?.split('@')[0]} 
                            </Text>
                            <Flex align='center'>
                                <Icon as={IoSparkles} color='brand.100' mr={1}/>
                                <Text color='gray.400'>1 karma</Text>
                            </Flex>
                        </Flex>
                        </>    
                    )
                    :
                    (
                        <Icon as={VscAccount} fontSize={24} color='gray.400' mr={1}/>
                    )
                }
                    </Flex>  
                    <ChevronDownIcon />  
                </Flex>
            </MenuButton>
            <MenuList>
                {user ? 
                    (
                    <>
                    <MenuItem fontSize='10pt' fontWeight={700} _hover={{bg:'blue.500',color:'white'}}>
                        <Flex align='center'>
                            <Icon as={CgProfile} mr={2} fontSize={20}/>
                            <Text>Profile</Text>
                        </Flex>
                    </MenuItem>
                    <MenuDivider/>
                    <MenuItem 
                        fontSize='10pt' 
                        fontWeight={700} 
                        _hover={{bg:'blue.500',color:'white'}}
                        onClick={logout}
                    >
                        <Flex align='center'>
                            <Icon as={MdOutlineLogin} mr={2} fontSize={20}/>
                            <Text>Log Out</Text>
                        </Flex>
                    </MenuItem>
                    </>
                    ) 
                    :
                    (
                    <>
                    <MenuItem 
                        fontSize='10pt' 
                        fontWeight={700} 
                        _hover={{bg:'blue.500',color:'white'}}
                        onClick={() => setAuthModalState({open:true,view:'login'})}
                    >
                        <Flex align='center'>
                            <Icon as={MdOutlineLogin} mr={2} fontSize={20}/>
                            <Text>Log In / Sign Up</Text>
                        </Flex>
                    </MenuItem>
                    </>
                    )
                
                }
                
            </MenuList>
        </Menu>
    
    )
}
export default UserMenu;