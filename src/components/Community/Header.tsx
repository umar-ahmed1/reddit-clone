import { Community } from '@/src/atoms/communitiesAtom';
import { Box, Button, Flex, Icon, Image, Text} from '@chakra-ui/react';
import React from 'react';
import { FaReddit } from 'react-icons/fa';
import useCommunityData from '../../hooks/useCommunityData'

type HeaderProps = {
    communityData: Community
};

const Header:React.FC<HeaderProps> = ({communityData}) => {
    //communityData is the data of the currently opened community, so if ur on r/thanos then its the data for r/thanos
    //communityStateValue comtains all the snippets (communities) the user is in so loop thru them and see if the id matches this community id
    const {communityStateValue, onJoinOrLeaveCommunity, loading} = useCommunityData();
    const isJoined = !!communityStateValue.mySnippets.find(item => item.communityId === communityData.id) //!! convert to boolean

    return (
        <Flex direction='column' width='100%' height='146px'>
            <Box height='50%' bg='blue.400'/>
            <Flex justify='center' bg='white' flexGrow={1}>
                <Flex width='95%' maxWidth='860px'>
                    {communityData.imageURL ? (
                        <Image/>
                    ) : (
                        <Icon fontSize={64} position='relative' top={-3} as={FaReddit} color='blue.500' border='4px solid white' borderRadius='50%'/>
                    )}
                    <Flex padding='10px 16px'>
                        <Flex direction='column' mr={6}>
                            <Text fontWeight={800} fontSize='16pt'>{communityData.id}</Text>
                            <Text fontWeight={600} fontSize='10pt' color='gray.400'>r/{communityData.id}</Text>
                        </Flex>
                        <Button 
                            height='30px' 
                            pr={6} 
                            pl={6} 
                            variant={isJoined ? 'outline' : 'solid'}
                            onClick = {() => onJoinOrLeaveCommunity(communityData,isJoined)}
                            isLoading={loading}
                        >
                            {isJoined ? 'Joined' : 'Join'}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    
    )
}
export default Header;