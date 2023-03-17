import type { Codec } from 'protons-runtime';
import type { Uint8ArrayList } from 'uint8arraylist';
export interface ChatMessage {
    message: Uint8Array;
    epoch: bigint;
    rlnProof?: Uint8Array;
    alias?: string;
}
export declare namespace ChatMessage {
    const codec: () => Codec<ChatMessage>;
    const encode: (obj: ChatMessage) => Uint8Array;
    const decode: (buf: Uint8Array | Uint8ArrayList) => ChatMessage;
}
