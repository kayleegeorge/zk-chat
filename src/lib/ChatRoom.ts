import { Message, RateLimitProof, WakuLight, WakuPrivacy } from "js-waku/lib/interfaces"
import { Contract, ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0";
import { UserID } from "../types/UserID";
import { RoomType } from "../types/ChatRoomOptions";
import * as rln from "@waku/rln"
import { ProtoChatMessage } from "../types/ChatMessage";

type MessageStore = {
    messageText: string;
    epoch: bigint;
    rlnProof: RateLimitProof | undefined;
}

/*
 * Create a chat room
 */
export class ChatRoom {
    public chatMembers: UserID[]
    public roomType: RoomType
    public contentTopic: string
    public decoder: rln.RLNDecoder<Message>
    public encoder: rln.RLNEncoder
    public chatStore: MessageStore[]
    public waku: WakuLight
    public rlnInstance: rln.RLNInstance
    public rlnContract: Contract
    public provider: Web3Provider 
    private userMemkey: rln.MembershipKey
    private userMemkeyIndex: number

    public constructor(
        contentTopic: string,
        roomType: RoomType,
        waku: WakuLight,
        rlnContract: Contract,
        provider: Web3Provider,
        userMemkey: rln.MembershipKey,
        userMemkeyIndex: number
    ) {
        this.contentTopic = contentTopic
        this.roomType = roomType
        this.rlnContract = rlnContract
        this.waku = waku
        this.provider = provider
        this.userMemkey = userMemkey
        this.userMemkeyIndex = userMemkeyIndex
        this.init()
    }

    public async init() {
        // init decoder
        this.decoder = new rln.RLNDecoder(
            this.rlnInstance, 
            new DecoderV0(this.contentTopic))
        await this.waku.filter.subscribe([this.decoder], this.processIncomingMessage)

        // init encoder
        this.encoder = new rln.RLNEncoder(
            new EncoderV0(this.contentTopic),
            this.rlnInstance,
            this.userMemkeyIndex,
            this.userMemkey)
    }

    public async processIncomingMessage(msgBuf: Message) {
        if (!msgBuf.payload || ProtoChatMessage.verify(msgBuf)) return;
        
        try {
            const { messageText, nickname, timestamp } = ProtoChatMessage.decode(msgBuf.payload)
            if (!msgBuf.rateLimitProof) {
                console.log('No Proof')
            } 
            // todo: handle proof

            console.log(`Message Received from ${nickname}: ${messageText}, sent at ${timestamp.toString()}`)
            this.chatStore.push({ messageText, epoch: timestamp, rlnProof: msgBuf.rateLimitProof })
        } catch(e) {
            console.log('Error receiving message')
        }
      }

    /* send a message */
    public async sendMessage(user: UserID, message: string) {
    const time = new Date()

    // encode to protobuf
    const protoMsg = ProtoChatMessage.create({
        messageText: message,
        timestamp: Math.floor(time.valueOf() / 1000),
        nickname: user.nickname,
    });
    const payload = ProtoChatMessage.encode(protoMsg).finish()
    await this.waku.lightPush.push(this.encoder, { payload, timestamp: time }).then(() => {
        console.log(`Sent Encoded Message: ${protoMsg}`)
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
    public async addChatMember(user: UserID) {
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