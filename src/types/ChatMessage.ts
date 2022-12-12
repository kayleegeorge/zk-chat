import { bytesToUtf8, utf8ToBytes } from "js-waku/lib/utils";
import * as proto from "../proto/chat_message"

/**
 * ChatMessage is used by the various show case waku apps that demonstrates
 * waku used as the network layer for chat group applications.
 */
export class ChatMessage {
  public constructor(public proto: proto.ChatMessage) {}

  /**
   * Create Chat Message with a utf-8 string as payload.
   */
  static fromUtf8String(
    message: string,
    epoch: bigint,
    // rln_proof: Uint8Array,
    alias?: string
  ): ChatMessage {
    const payload = utf8ToBytes(message);

    return new ChatMessage({
        message, 
        epoch,
        alias
    })
  }

  /**
   * Decode a protobuf payload to a ChatMessage.
   * @param bytes The payload to decode.
   */
  static decode(bytes: Uint8Array): ChatMessage {
    const protoMsg = proto.ChatMessage.decode(bytes);
    return new ChatMessage(protoMsg);
  }

  /**
   * Encode this ChatMessage to a byte array, to be used as a protobuf payload.
   * @returns The encoded payload.
   */
  encode(): Uint8Array {
    return proto.ChatMessage.encode(this.proto);
  }

  get epoch(): bigint {
    return this.epoch
  }

  get alias(): string {
    return this.proto.alias
  }

  get message(): string {
    return this.proto.message ?? ""
  }
}