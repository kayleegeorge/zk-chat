import { RLNFullProof } from "rlnjs/src"
import { dateToEpoch } from "../utils/formatting"
import { ChatMessage } from "./chatMessage"


/* chatMessage type with alias attached */
export class Message {
  public chatMessage: ChatMessage
  public alias: string | undefined

  constructor(chatMessage: ChatMessage, alias?: string) {
    this.chatMessage = chatMessage
    this.alias = alias
  }

  // TODO: which type of message is the Waku sending
  static fromWakuMessage(wakuMsg: any): Message | undefined {
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

  static fromUtf8String(text: string, rln_proof: RLNFullProof, alias?: string): Message {
    const epoch = dateToEpoch(new Date())
    return new Message(ChatMessage.fromUtf8String(text, epoch, rln_proof), alias)
  }

  get message() {
    return this.chatMessage.messageAsUtf8
  }

  get epoch() {
    return this.chatMessage.epoch
  }

  get rln_proof() {
    return this.chatMessage.rln_proof
  }
}