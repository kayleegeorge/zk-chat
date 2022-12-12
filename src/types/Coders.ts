import { Decoder, Encoder, Message, ProtoMessage } from "js-waku/lib/interfaces";

export declare class EncoderV0 implements Encoder {
    contentTopic: string;
    constructor(contentTopic: string);
    toWire(message: Partial<Message>): Promise<Uint8Array>;
    toProtoObj(message: Partial<Message>): Promise<ProtoMessage>;
}
export declare class DecoderV0 implements Decoder<Message> {
    contentTopic: string;
    constructor(contentTopic: string);
    fromWireToProtoObj(bytes: Uint8Array): Promise<ProtoMessage | undefined>;
    fromProtoObj(proto: ProtoMessage): Promise<Message | undefined>;
}