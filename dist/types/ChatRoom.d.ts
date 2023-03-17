import { Web3Provider } from '@ethersproject/providers';
import { RoomType } from './types/ChatRoomOptions';
import { Connection } from './Connection';
import RLN from './RLN';
import User from './User';
export default class ChatRoom {
    roomType: RoomType;
    chatRoomName: string;
    rlnInstance: RLN;
    provider: Web3Provider | undefined;
    connection: Connection;
    private chatMembers;
    constructor(chatRoomName: string, roomType: RoomType, chatMembers: User[], rlnInstance: RLN, connection: Connection, provider?: Web3Provider);
    retrieveMessageStore(): Promise<void>;
    sendMessage(text: string, alias: string): Promise<void>;
    addChatMember(member: User): Promise<User>;
    getChatMembers(): User[];
}
