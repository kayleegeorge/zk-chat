declare module 'protons' {
    // message structure using protobuf
    export type Message = {
        message: string;
        // timestamp: Date; do we want this instead of epoch?
        epoch?: number; 
        rln_proof?: Uint8Array;
    }
    function protons(init: string): {
        Message: {
            encode: (message: Message) => Uint8Array,
            decode: (payload: Uint8Array | undefined) => Message
        }
    }
    // reference: https://github.com/status-im/wakuconnect-vote-poll-sdk/blob/master/packages/core/types/protons/index.d.ts
    //export = protons
}

