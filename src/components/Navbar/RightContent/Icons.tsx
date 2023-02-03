import { Flex, Icon, Tooltip} from '@chakra-ui/react';
import React from 'react';
import {BsArrowUpRightCircle, BsChatDots} from 'react-icons/bs'
import{GrAdd} from 'react-icons/gr' 
import {
    IoFilterCircleOutline,
    IoNotificationsOutline,
    IoVideocamOutline,
} from 'react-icons/io5'

import { useSignOut } from 'react-firebase-hooks/auth';
import {auth} from '../../../firebase/clientApp'

type IconsProps = {
    
};
//we fragmented the second half of icons cuz they are always visible
//we flexed the first half of icons because they disseapear on small  screen
const Icons:React.FC<IconsProps> = () => {
    const [signOut, loading, error] = useSignOut(auth);
    return (
        <Flex>
            <Flex display ={{base:'none',md:'flex'}} align='center' borderRight={2} borderColor='gray.200'>
                <Tooltip hasArrow label='Popular' fontSize='9pt'>
                    <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{bg:'gray.200'}}>
                        <Icon as={BsArrowUpRightCircle} fontSize={20}/>
                    </Flex>
                </Tooltip>
                
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{bg:'gray.200'}}>
                    <Icon as={IoFilterCircleOutline} fontSize={22}/>
                </Flex>
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{bg:'gray.200'}}>
                    <Icon as={IoVideocamOutline} fontSize={22}/>
                </Flex>
            </Flex>
            <> 
                <Tooltip hasArrow label='Chat' fontSize='9pt'>
                    <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{bg:'gray.200'}}>
                        <Icon as={BsChatDots} fontSize={20}/>
                    </Flex>
                </Tooltip>
                <Tooltip hasArrow label='Notifications' fontSize='9pt'>
                    <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{bg:'gray.200'}}>
                        <Icon as={IoNotificationsOutline} fontSize={20}/>
                    </Flex>
                </Tooltip>
                <Tooltip hasArrow label='Create Post' fontSize='9pt'>
                    <Flex display={{base:'none', md:'flex'}} mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{bg:'gray.200'}}>
                        <Icon as={GrAdd} fontSize={20}/>
                    </Flex>
                </Tooltip>
            
            </>
        </Flex>
    )
}
export default Icons;