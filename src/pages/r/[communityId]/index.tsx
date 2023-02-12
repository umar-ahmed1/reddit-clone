import { Community } from '@/src/atoms/communitiesAtom';
import { firestore } from '@/src/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import safeJsonStringify from 'safe-json-stringify'
import CommunityNotFound from '@/src/components/Community/CommunityNotFound';
import Header from '@/src/components/Community/Header';
import PageContent from '@/src/components/Layout/PageContent';
import CreatePostLink from '@/src/components/Community/CreatePostLink';
import Posts from '@/src/components/Posts/Posts';

type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage:React.FC<CommunityPageProps> = ({communityData}) => {
    //if the community data was an empty string the community doesnt exist so return page for that
    if(!communityData)
        return(
            <CommunityNotFound/>
        )

    return (
        <>
            <Header communityData={communityData}/>
            <PageContent>
                <>
                    <CreatePostLink/>
                    <Posts communityData={communityData}/>
                </>
                <>
                    <div>RHS</div>
                </>
            </PageContent>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext){
    try{
        //get all the info about the community
        const communityDocRef = doc(firestore,'communities',context.query.communityId as string)
        const communityDoc = await getDoc(communityDocRef)

        //return all the info to the component as props
        return{
            props:{
                communityData:communityDoc.exists() ? JSON.parse(safeJsonStringify({id:communityDoc.id,...communityDoc.data()})) : ''
            },
        }
        //if theres an error
    } catch (error){
        console.log('getServerSideProps error',error)
    }

}

export default CommunityPage;

