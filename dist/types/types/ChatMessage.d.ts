import * as protoType from '../proto/ChatMessage';
import { MessageV0 } from 'js-waku/lib/waku_message/version_0';
export declare class ChatMessage {
    proto: protoType.ChatMessage;
    constructor(proto: protoType.ChatMessage);
    static fromUtf8String(text: string, epoch: bigint, rlnProof?: Uint8Array, alias?: string): ChatMessage;
    static decodeWakuMessage(wakuMsg: MessageV0): ChatMessage | undefined;
    /**
     * Decode a protobuf payload to a ChatMessage.
     * @param bytes The payload to decode.
     */
    static decode(bytes: Uint8Array): ChatMessage;
    /**
     * Encode this ChatMessage to a byte array, to be used as a protobuf payload.
     * @returns The encoded payload.
     */
    encode(): Uint8Array;
    get epoch(): bigint;
    get message(): string;
    get rlnProof(): Uint8Array | undefined;
    get alias(): string | undefined;
}
