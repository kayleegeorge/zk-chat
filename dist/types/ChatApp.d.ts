import { Web3Provider } from '@ethersproject/providers';
import ChatRoom from './ChatRoom';
import { RoomType } from './types/ChatRoomOptions';
import { Connection } from './Connection';
import { Contract } from 'ethers';
import User from './User';
import RLN from './RLN';
export default class ChatApp {
    appName: string;
    chatRoomStore: Map<string, ChatRoom>;
    rln: RLN;
    provider: Web3Provider | undefined;
    connection: Connection;
    onChain: Contract | undefined;
    constructor(appName: string, onChain?: Contract, provider?: Web3Provider, existingIdentity?: string, rlnIdentifier?: bigint);
    registerUserOnChain(): Promise<import("@semaphore-protocol/identity").Identity>;
    createChatRoom(name: string, roomType: RoomType, chatMembers?: User[]): ChatRoom;
    fetchChatRoomMsgs(contentTopic: string): Promise<void | undefined>;
    fetchChatRoomsNames(): string[];
}
