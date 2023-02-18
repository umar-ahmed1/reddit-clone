import { Timestamp } from 'firebase/firestore';
import {atom} from 'recoil'

export interface Community{
    id:string;
    creatorId:string;
    numberOfMembers: number;
    privacyType:'public' | 'restricted' | 'private';
    createdAt?: Timestamp;
    imageURL?: string;
}

//make an object kind of thing with each snippet
export interface CommunitySnippet {
    communityId: string;
    isModerator?: boolean;
    imageURL?: string;
}

//the state contains an array of all the community snippets ur in
interface CommunityState {
    mySnippets: CommunitySnippet[];
    currentCommunity?: Community;
    snippetsFetched: boolean;
}
//default empty
const defaultCommunityState: CommunityState = {
    mySnippets: [],
    snippetsFetched: false,
}
//create the actual state 
export const communityState = atom<CommunityState>({
    key:'communitiesState',
    default: defaultCommunityState
})