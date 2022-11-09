declare module 'protons' {

    export type ChatMessage = {
        message: string
        epoch: number
        rln_proof: Uint8Array
    }

    function protons(init: string): {
        ChatMessage: {
            encode: (message: ChatMessage) => Uint8Array,
            decode: (payload: Uint8Array | undefined) => ChatMessage
        }
    }
    export default protons
}