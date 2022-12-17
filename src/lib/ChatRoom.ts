import { Message, RateLimitProof, WakuLight } from "js-waku/lib/interfaces"
import { Web3Provider } from "@ethersproject/providers"
import { RoomType } from "../types/ChatRoomOptions"
import { UnsubscribeFunction } from "js-waku/lib/waku_filter"
import { MembershipKey, Proof, RLNDecoder, RLNEncoder, RLNInstance } from "../../node_modules/@waku/rln/dist/index.d"
import { ChatMessage } from "../types/ChatMessage"
import { dateToEpoch } from "../utils/formatting"
import { Connection, ConnectionMethod, ProofState } from "./Connection"
import { RLN, RLNMember } from "../lib/RLN"
import { RLNFullProof } from "rlnjs/src/types"

type MessageStore = {
    message: string
    epoch: bigint
    rlnProof: RLNFullProof | undefined
    proofState: ProofState
    alias: string
}

/*
chat room should abstract away processing/sending message. 
generating RLN instance / connection.ts

Connection and RLN are wrapper classes

have one connection for waku 

take away Waku stuff from here and abstract away 
and abstract away rln stuff
*/

/*
 * Create a chat room
 */
export class ChatRoom {
    public roomType: RoomType
    public contentTopic: string
    public decoder: RLNDecoder<Message>
    public encoder: RLNEncoder
    public chatStore: MessageStore[]
    public rlnInstance: RLN
    public provider: Web3Provider 
    public connection: Connection
    private rlnMember: RLNMember
    private chatMembers: string[]
    public unsubscribeWaku?: UnsubscribeFunction 

    public constructor(
        contentTopic: string,
        roomType: RoomType,
        provider: Web3Provider,
        rlnMember: RLNMember, 
        chatMembers: string[],
        rlnInstance: RLN,
    ) {
        this.contentTopic = contentTopic
        this.roomType = roomType
        this.provider = provider
        this.rlnInstance = rlnInstance
        this.rlnMember = rlnMember
        this.chatMembers = chatMembers
        this.chatStore = []

        this.connection = new Connection(ConnectionMethod.Waku, this.rlnInstance, this.rlnMember, this.contentTopic) 
    }

    // encryption: create unique userID by hashing together rlncred + chatroom
    // check which type message is

    public async receiveMessage() {
        const receivedMsg = this.connection.processIncomingMessage() // todo: fix
        this.chatStore.push(receivedMsg)
    }
    

    /* clean up message store rln proofs after n epochs */
    public async cleanMessageStore(n: number) {
        let msgIndex = -1
        const time = new Date()
        const curTime = BigInt(Math.floor(time.valueOf() / 1000))
        // destroy rln proof after n epochs
        while(this.chatStore[msgIndex].epoch - curTime > n) {
           this.chatStore[msgIndex].rlnProof = undefined 
           msgIndex += 1 
        } 
    }

    /* basic util functions */
    public getAllMessages() {
        return this.chatStore
    }
    public getLastMessage() {
        return this.chatStore[-1]
    }
    public async addChatMember(user: string) {
        if (this.roomType == RoomType.PrivGroup && this.chatMembers.length == 5) {
            console.error('Cannot add more than 5 members to a private group')
        } else {
            this.chatMembers.push(user)
        }
    }
    public getChatMembers() {
        return this.chatMembers
    }
}