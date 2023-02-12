import { collection, doc, getDocs, increment, writeBatch } from 'firebase/firestore';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { Community, CommunitySnippet, communityState } from '../atoms/communitiesAtom';
import { auth, firestore } from '../firebase/clientApp';

const useCommunityData = () => {
    const [user] = useAuthState(auth)
    const [communityStateValue,setCommunityStateValue] = useRecoilState(communityState)
    const [loading,setLoading] = React.useState(false)
    const [error,setError] = React.useState('')
    const setAuthModalState = useSetRecoilState(authModalState)
    
    const onJoinOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        //if no user then login
        if(!user){
            setAuthModalState({open:true,view:'login'})
        }
        //leave if joined otherwise join
        if (isJoined){
            leaveCommunity(communityData.id)
            return
        } else {
            joinCommunity(communityData)
        }

    }
    //get all the currently logged in user communites and store them in global state
    const getMySnippets = async () => {
        setLoading(true)
        try{
            const snippetDocs = await getDocs(collection(firestore,`users/${user?.uid}/communitySnippets`)) //get all the communites user is in
            const snippets = snippetDocs.docs.map(doc => ({...doc.data()})) //convert all the doc items into objects
            setCommunityStateValue(prev => ({ //put the snippets we got into the global state
                ...prev,
                mySnippets : snippets as CommunitySnippet[]
            }))
        } catch(error:any){
            console.log('getMySnippetsError',error)
            setError(error.message)
        }
        setLoading(false)
    }

    //for join and leave community we dont need to check if the community exists first (we know it does) so we dont need a transaction.get we just need a batch write

    const joinCommunity = async (communityData : Community) => {
        
        try{
            setLoading(true)
            const batch=writeBatch(firestore) 
            const newSnippet: CommunitySnippet = { //create the snippet to add to database
                communityId: communityData.id,
                imageURL: communityData.imageURL || ''
            }
            //create a new community snippet for the user (we do batch.set because it doesnt exist)
            batch.set(doc(firestore,`users/${user?.uid}/communitySnippets`,communityData.id),newSnippet)
            //add 1 to the number of members of the community (the community alrdy exzists so we just updating it)
            batch.update(doc(firestore,'communities',communityData.id),{
                numberOfMembers: increment(1)
            })
            //commit the two changes
            await batch.commit()

            //update the global community state snippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: [...prev.mySnippets,newSnippet],
            }))
            setLoading(false)

        } catch(error:any){
            console.log('joinCommunity erorr',error)
        }


    }



    const leaveCommunity = async (communityId: string) => {
        //update the global community state snippets

        try{
            const batch=writeBatch(firestore)
            //delete the community snippet for the user
            batch.delete(doc(firestore,`users/${user?.uid}/communitySnippets`,communityId))
            //remove 1 from the number of members of the community
            batch.update(doc(firestore,'communities',communityId),{
                numberOfMembers: increment(-1)
            })
            //commit the two changes
            await batch.commit()
            //update the global community state snippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: prev.mySnippets.filter((item) => item.communityId !== communityId)
            }))
            setLoading(false)

        }catch(error: any){
            console.log('leaveCommunityerror',error.message)
            setError(error.message)
        }


    }

    //get the snippets when the user changes
    React.useEffect(() =>{
        if (!user) return //if no user yet then cancel
        getMySnippets();
    },[user])

    return {
        communityStateValue,
        onJoinOrLeaveCommunity,
        loading,
    }
}
export default useCommunityData;