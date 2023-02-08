import { bytesToUtf8, utf8ToBytes } from "../utils/formatting"
import { RLNFullProof } from "rlnjs"
import * as proto from "../proto/chat_message"

export class ChatMessage {
  public constructor(public proto: proto.ChatMessage) {}

  /* Create Chat Message with a utf-8 string as payload. */
  static fromUtf8String(
    text: string,
    epoch: bigint,
    rln_proof: RLNFullProof,
    alias?: string
  ): ChatMessage {
    const message = utf8ToBytes(text)

    return new ChatMessage({
        message, 
        epoch,
        rln_proof,
        alias
    })
  }

    /* decodes received msg payload */
    static decodeMessage(wakuMsg: any): ChatMessage | undefined {
      if (wakuMsg.payload) {
        try {
          return ChatMessage.decode(wakuMsg.payload)
        } catch (e) {
          console.error("Failed to decode chat message", e)
        }
      }
      return;
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

  get message(): string {
    return bytesToUtf8(this.proto.message)
  }

  get rln_proof(): RLNFullProof | undefined {
    return this.proto.rln_proof
  }

  get alias(): string | undefined {
    return this.alias ?? ""
  }
}