import { dateToEpoch } from "../utils/formatting"
import { ChatMessage } from "./chatMessage"
import { MessageV0 } from "../../node_modules/js-waku/dist/lib/waku_message/version_0.js"

// TODO: investigate what type of message waku sends (Message? Message V0?)

export class Message {
  public chatMessage: ChatMessage
  // WakuMessage timestamp
  public sentTimestamp: Date | undefined
  // might have to add rln proof? 

  constructor(chatMessage: ChatMessage, sentTimestamp: Date | undefined) {
    this.chatMessage = chatMessage
    this.sentTimestamp = sentTimestamp
  }

  static fromWakuMessage(wakuMsg: MessageV0): Message | undefined {
    if (wakuMsg.payload) {
      try {
        const chatMsg = ChatMessage.decode(wakuMsg.payload);
        if (chatMsg) {
          return new Message(chatMsg, wakuMsg.timestamp);
        }
      } catch (e) {
        console.error("Failed to decode chat message", e);
      }
    }
    return;
  }

  static fromUtf8String(message: string, rln_proof: Uint8Array, alias?: string): Message {
    const date = new Date()
    return new Message(ChatMessage.fromUtf8String(message, dateToEpoch(date), rln_proof, alias), date)
  }

  get message() {
    return this.chatMessage.message;
  }

  get epoch() {
    return this.chatMessage.epoch;
  }

  get rln_proof() {
    return this.chatMessage.rln_proof
  }
  
  get alias() {
    return this.chatMessage.alias
  }
}