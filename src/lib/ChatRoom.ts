import { Message, WakuLight, WakuPrivacy } from "js-waku/lib/interfaces"
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0";
import { UserID } from "../types/UserID";
import { RoomType } from "../types/ChatRoomOptions";
import { RLNFullProof } from "@zk-kit/protocols";
import * as rln from "@waku/rln"
import { ProtoChatMessage } from "../types/ChatMessage";

export type MessageStore = {
    messageText: string;
    epoch: bigint;
    rlnProof: RLNFullProof;
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

    public constructor(
        contentTopic: string,
        roomType: RoomType,
        waku: WakuLight
    ) {
        this.contentTopic = contentTopic
        this.roomType = roomType
        this.decoder = new rln.RLNDecoder(
            this.rlnInstance, 
            new DecoderV0(this.contentTopic))
        this.encoder = new rln.RLNEncoder(
            this.contentTopic,
            new EncoderV0(this.contentTopic),
            this.rlnInstance,
            membershipIndex,
            membershipKey)
        this.waku = waku
        this.initSub()
    }

    public async initSub() {
        await this.waku.filter.subscribe([this.decoder], this.processIncomingMessage)
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
            this.chatStore.push({ })
        } catch(e) {
            console.log('Error receiving message')
        }
      }

      /* send a message */
      public async sendMessage(user: UserID, message: string, contentTopic: string) {
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

    public getMessages() {
        return this.chatStore
    }

    public addChatMember(user: UserID) {
       this.chatMembers.push(user)
    }

    public getChatMembers() {
        return this.chatMembers
    }
}