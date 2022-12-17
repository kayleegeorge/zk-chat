import { bytesToUtf8, utf8ToBytes } from "js-waku/lib/utils";
import { RLNFullProof } from "rlnjs/src";
import * as proto from "../proto/chat_message"

export class ChatMessage {
  public constructor(public proto: proto.ChatMessage) {}

  /* Create Chat Message with a utf-8 string as payload. */
  static fromUtf8String(
    text: string,
    epoch: bigint,
    rln_proof: RLNFullProof,
  ): ChatMessage {
    const message = utf8ToBytes(text)

    return new ChatMessage({
        message, 
        epoch,
        rln_proof,
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

  get messageAsUtf8(): string {
    return this.proto.message ? bytesToUtf8(this.proto.message) : ""
  }

  get rln_proof(): RLNFullProof | undefined {
    return this.proto.rln_proof
  }
}