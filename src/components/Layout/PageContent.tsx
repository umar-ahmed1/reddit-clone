import { Flex } from '@chakra-ui/react';
import React from 'react';

type PageContentProps = {
    children: any;
};

const PageContent:React.FC<PageContentProps> = ({children}) => {
    //the children are the LHS and RHS react fragments
    return (
        <Flex justify='center' padding='16px 0px' border='1px solid red'>
            <Flex width='95%' justify='center' border='1px solid green' maxWidth='860px'>
                {/*LHS*/}
                <Flex 
                    direction='column' 
                    border='1px solid blue'
                    width={{base:'100%',md:'65%'}}
                    mr={{base:0,md:6}}
                >
                    {children && children[0 as keyof typeof children]}
                </Flex>
                {/*RHS*/}
                <Flex 
                    direction='column' 
                    border='1px solid blue'
                    display={{base:'none',md:'flex'}}
                    flexGrow={1}
                >
                    {children && children[1 as keyof typeof children]}
                </Flex>
            </Flex>
        </Flex>
    )
}
export default PageContent;