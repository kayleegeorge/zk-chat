import { Message, RateLimitProof, WakuLight } from "js-waku/lib/interfaces"
import { Web3Provider } from "@ethersproject/providers"
import { DecoderV0, EncoderV0 } from "../types/Coders"
import { RoomType } from "../types/ChatRoomOptions"
import { UnsubscribeFunction } from "js-waku/lib/waku_filter"
import { MembershipKey, RLNDecoder, RLNEncoder, RLNInstance } from "../../node_modules/@waku/rln/dist/index.d"
import { ChatMessage } from "../types/ChatMessage"
import { dateToEpoch } from "../utils/formatting"

type MessageStore = {
    message: string;
    epoch: bigint;
    rlnProof: RateLimitProof | undefined;
}


/*
 * Create a chat room
 */
export class ChatRoom {
    public roomType: RoomType
    public contentTopic: string
    public decoder: RLNDecoder<Message>
    public encoder: RLNEncoder
    public chatStore: MessageStore[]
    public waku: WakuLight
    public rlnInstance: RLNInstance
    public provider: Web3Provider 
    private userMemkey: MembershipKey    
    private userMemkeyIndex: number
    private chatMembers: string[]
    public unsubscribeWaku?: UnsubscribeFunction 

    public constructor(
        contentTopic: string,
        roomType: RoomType,
        waku: WakuLight,
        provider: Web3Provider,
        userMemkey: MembershipKey,
        userMemkeyIndex: number,
        chatMembers: string[],
        rlnInstance: RLNInstance,
    ) {
        this.contentTopic = contentTopic
        this.roomType = roomType
        this.waku = waku
        this.provider = provider
        this.rlnInstance = rlnInstance
        this.userMemkey = userMemkey
        this.userMemkeyIndex = userMemkeyIndex
        this.chatMembers = chatMembers
        this.chatStore = []
        
        /* init decoder and encoder */
        this.decoder = new RLNDecoder(
            this.rlnInstance, 
            new DecoderV0(this.contentTopic))
        this.encoder = new RLNEncoder(
            new EncoderV0(this.contentTopic),
            this.rlnInstance,
            this.userMemkeyIndex,
            this.userMemkey)
        this.subscribeWaku()
    }

    public async subscribeWaku() {        
        this.unsubscribeWaku = await this.waku.filter.subscribe([this.decoder], this.processIncomingMessage)
    }

    // encryption: create unique userID by hashing together rlncred + chatroom

    public async processIncomingMessage(msgBuf: Message) {
        if (!msgBuf.payload) return
        
        try {
            const msg = ChatMessage.decode(msgBuf.payload)
            console.log(msg)
            if (!msgBuf.rateLimitProof) {
                console.log('No Proof')
            } 
            // todo: handle proof
            // console.log(`Message Received: ${message}, sent at ${timestamp.toString()}`)
            //this.chatStore.push({ message, epoch: timestamp, rlnProof: msgBuf.rateLimitProof })
        } catch(e) {
            console.log('Error receiving message')
        }
      }

    /* send a message */
    public async sendMessage(message: string, alias: string, rln_proof: ) {
        const date = new Date()

        // encode to protobuf
        const protoMsg = new ChatMessage({
            message: message,
            epoch: dateToEpoch(date),
            rln_proof: rln_proof,
            alias: alias,
        });
        const payload = protoMsg.encode()
        const result = await this.waku.lightPush.push(this.encoder, { payload }).then(() => {
            console.log(`Sent Encoded Message: ${result}`)
        })
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