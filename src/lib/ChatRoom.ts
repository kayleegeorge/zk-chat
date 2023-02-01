import { Web3Provider } from "@ethersproject/providers"
import { RoomType } from "../types/ChatRoomOptions"
import { UnsubscribeFunction } from "js-waku/lib/waku_filter"
import { ChatMessage } from "../types/ChatMessage"
import { Connection, ConnectionMethod, ProofState } from "../lib/Connection"
import { RLN } from "./RLN"
import { RLNFullProof } from "rlnjs"

export type MessageStore = {
    message: string
    epoch: bigint
    rlnProof: RLNFullProof | undefined
    proofState: ProofState
    alias: string
}

/*
 * Create a chat room
 */
export class ChatRoom {
    public roomType: RoomType
    public contentTopic: string
    public chatStore: ChatMessage[] // eventually switch to MessageStore[]
    public rlnInstance: RLN
    public provider: Web3Provider 
    public connection: Connection
    private chatMembers: string[]
    public unsubscribeWaku?: UnsubscribeFunction 

    public constructor(
        contentTopic: string,
        roomType: RoomType,
        provider: Web3Provider,
        chatMembers: string[],
        rlnInstance: RLN,
    ) {
        this.contentTopic = contentTopic
        this.roomType = roomType
        this.provider = provider
        this.rlnInstance = rlnInstance
        this.chatMembers = chatMembers
        this.chatStore = []

        this.connection = new Connection(ConnectionMethod.Waku, this.rlnInstance, this.rlnInstance.identity, updateChatStore, this.contentTopic) 
    }

    /* retrieve Store Messages */
    public async retrieveMessageStore() {
        this.connection.retrieveMessageStore()
    }
    
    /* send a message */
    public async sendMessage(text: string, alias: string) {
        this.connection.sendMessage(text, alias)
    }

    /* clean up message store rln proofs after n epochs */
    public async cleanMessageStore(n: number) {
        let msgIndex = -1
        const time = new Date()
        const curTime = BigInt(Math.floor(time.valueOf() / 1000))
        // TODO: destroy rln proof after n epochs

        // while(this.chatStore[msgIndex].epoch - curTime > n) {
        //    this.chatStore[msgIndex].rln_proof = undefined 
        //    msgIndex += 1 
        // } 
    }

    /* basic util functions */
    public getAllMessages() {
        return this.chatStore
    }
    public getLastMessage() {
        return this.chatStore[-1]
    }
    public async addChatMember(memPubkey: string) {
        if (this.roomType == RoomType.PrivGroup && this.chatMembers.length == 5) {
            console.error('Cannot add more than 5 members to a private group')
        } else {
            this.chatMembers.push(memPubkey)
        }
    }
    public getChatMembers() {
        return this.chatMembers
    }
}