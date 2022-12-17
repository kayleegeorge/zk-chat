import { RLNFullProof } from "rlnjs/src";
import { ChatMessage } from "../proto/chat_message";
import { dateToEpoch } from "../utils/formatting";
import { proto_message as proto } from "../proto/index"


export interface IProtoMessage {
    message: Uint8Array | undefined;
    contentTopic: string | undefined;
    epoch: bigint | undefined;
    rln_proof: RLNFullProof | undefined;
}

export interface IMessage {
    message?: Uint8Array;
    epoch?: bigint;
    rln_proof?: RLNFullProof;
}

export interface IEncoder {
    contentTopic: string;
    toWire: (message: IMessage) => Promise<Uint8Array | undefined>;
    toProtoObj: (message: IMessage) => Promise<IProtoMessage | undefined>;
}

export interface IDecoder<T extends DecodedMessage> {
    contentTopic: string;
    fromWireToProtoObj: (bytes: Uint8Array) => Promise<IProtoMessage | undefined>;
    fromProtoObj: (proto: IProtoMessage) => Promise<T | undefined>;
  }

/* ChatMessage encoder */
export class rlnEncoder implements IEncoder {
    constructor(public contentTopic: string) {}

    async toWire(msgBuf: IMessage): Promise<Uint8Array> {
    return proto.ChatMessage.encode(await this.toProtoObj(msgBuf));
  }

  async toProtoObj(msgBuf: IMessage): Promise<IProtoMessage> {
    const epoch = msgBuf.epoch ?? dateToEpoch(new Date())

    return {
      message: msgBuf.message,
      contentTopic: this.contentTopic,
      epoch: epoch,
      rln_proof: msgBuf.rln_proof,
    };
  }
}

export function createEncoder(contentTopic: string): rlnEncoder {
    return new rlnEncoder(contentTopic)
  }


export class DecodedMessage implements IMessage {
    constructor(protected proto: proto.ChatMessage) {}

    get message(): Uint8Array | undefined {
        if (this.proto.message) {
            return new Uint8Array(this.proto.message)
        }
        return
    }
    get epoch(): bigint | undefined {
        return this.proto.epoch
    }
    get rln_proof(): RLNFullProof | undefined {
        return this.proto.rln_proof
    }

}

/* ChatMessage decoder */
export class rlnDecoder implements IDecoder<DecodedMessage> {
    constructor(public contentTopic: string) {}

    fromWireToProtoObj(bytes: Uint8Array): Promise<IProtoMessage | undefined> {
        const protoMessage = proto.ChatMessage.decode(bytes)

        return Promise.resolve({
          message: protoMessage.message ?? undefined,
          contentTopic: this.contentTopic,
          epoch: protoMessage.epoch ?? undefined,
          rln_proof: protoMessage.rln_proof ?? undefined,
        })
      }
      async fromProtoObj(proto: IProtoMessage): Promise<DecodedMessage | undefined> {    
        return new DecodedMessage(proto)
      }
}

export function createDecoder(contentTopic: string): rlnDecoder {
    return new rlnDecoder(contentTopic)
}