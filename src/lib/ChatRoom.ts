import { Waku } from "js-waku/lib/interfaces"
import { ChatApp, RegistrationType } from "./ChatApp"
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { DecoderV0 } from "js-waku/lib/waku_message/version_0";
import { UserID } from "../types/UserID";
import { RoomType } from "../types/ChatRoomOptions";

/*
 * Create a chat room
 */
export class ChatRoom {
    public chatMembers: UserID[]
    public contentTopic: string
    public roomType: RoomType
    public gateKeepers?: UserID[]

    public constructor(
        contentTopic: string,
        roomType: RoomType
    ) {
        this.contentTopic = contentTopic
        this.roomType = roomType
        // TODO: add caller of the chat 
        if (roomType === RoomType.GatekeepersGroup) {
            this.gateKeepers = []
        }
    }

    public addChatMember(user: UserID) {
       this.chatMembers.push(user)
    }

    public getChatMembers() {
        return this.chatMembers
    }

    public addGateKeeper(user: UserID) {
        if (this.roomType === RoomType.GatekeepersGroup) {
            this.gateKeepers.push(user)
            return this.gateKeepers
        }
        console.log("Not a gatekeeper group")
        return null
    }

    public getGatekeepers() {
        return this.gateKeepers
    }
}