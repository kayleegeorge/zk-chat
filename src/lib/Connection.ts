import { createLibp2p } from "../utils/createLibp2p"
import { WakuLight } from "js-waku/lib/interfaces";
import { UnsubscribeFunction } from "js-waku/lib/waku_filter";
import { RLN } from "./RLN";
import { ChatMessage } from "../types/ChatMessage";
import { dateToEpoch, utf8ToBytes } from "../utils/formatting";
import { DecoderV0, EncoderV0, MessageV0 } from "js-waku/lib/waku_message/version_0";
import { Libp2pOptions } from "libp2p/src/index";
import { Libp2pNode } from "libp2p/dist/src/libp2p";
import { getDates, TimePeriod } from "../utils/getDates";

export enum ConnectionMethod {
    Libp2p = "libp2p",
    Waku = "waku"
}

export enum ProofState {
    none = 'none',
    processing = 'processing',
    verified = 'verified',
    invalid = 'invalid'
}

export class Connection {
    public connectionMethod: ConnectionMethod
    private connectionInstance: Libp2pConnection | WakuConnection
    private rlnInstance: RLN

    constructor(connectionMethod: ConnectionMethod, 
                rlnInstance: RLN, 
                updateChatStore: (value: ChatMessage[]) => void,
                wakuContentTopic: string, // change to optional 
                libp2pOptions?: Libp2pOptions) {
        this.connectionMethod = connectionMethod
        this.rlnInstance = rlnInstance
        // default Waku
        this.connectionInstance = new WakuConnection(wakuContentTopic, rlnInstance, updateChatStore)

        if (this.connectionMethod == ConnectionMethod.Libp2p) {
            this.connectionInstance = new Libp2pConnection(libp2pOptions)
        }
    }

    public connect() {
        this.connectionInstance.connect()
    }

    public disconnect() {
        if (this.connectionInstance.disconnect) this.connectionInstance.disconnect()
    }

    /* send message by encoding to protobuf -> payload for waku message */ 
    public async sendMessage(text: string, alias: string) {
        const date = new Date()

        const rawMessage = { message: text, epoch: dateToEpoch(date)} 
        const rln_proof = await this.rlnInstance.generateRLNProof(rawMessage.message, rawMessage.epoch)
        
        const protoMsg = new ChatMessage({
            message: utf8ToBytes(text),
            epoch: dateToEpoch(date), 
            alias
        })
        const payload = protoMsg.encode()
        this.connectionInstance.sendMessage(payload)
    }

    public async retrieveMessageStore() {
        this.connectionInstance.retrieveMessageStore()
    }

}

/* Connecting with libp2p as networking layer */
class Libp2pConnection {
    public libp2pOptions?: Libp2pOptions
    public node: Libp2pNode | undefined

    constructor(libp2pOptions?: Libp2pOptions) {
        this.libp2pOptions = libp2pOptions
    }

    public async connect() {
        const node = await createLibp2p(this.libp2pOptions)
        await node.start()
    }

    public async disconnect() {
        if (this.node) this.node.stop()
    }

    public async sendMessage() {
        /* todo */
    }
    public async retrieveMessageStore() {
        /*todo*/
    }
}


/* Connecting with Waku as networking layer */
class WakuConnection {
    public waku: WakuLight | undefined
    public disconnect: UnsubscribeFunction | undefined
    public updateChatStore: (value: ChatMessage[]) => void
    private decoder: DecoderV0
    private encoder: EncoderV0
    private contentTopic: string
    private rlnInstance: RLN
    // private ChatStore: ProofStore[]

    constructor(contentTopic: string, rlnInstance: RLN, updateChatStore: (value: ChatMessage[]) => void) {
        this.contentTopic = contentTopic
        this.rlnInstance = rlnInstance
        this.updateChatStore = updateChatStore
        this.decoder = new DecoderV0(this.contentTopic)
        this.encoder = new EncoderV0(this.contentTopic)
    }

    public async connect() {
        this.disconnect = await this.waku?.filter.subscribe([this.decoder], this.processIncomingMessage)
    }

    /* send a message using Waku */
    public async sendMessage(payload: Uint8Array) {
        await this.waku?.lightPush.push(this.encoder, { payload }).then((msg) => {
            console.log(`Sent Encoded Message: ${msg}`)
        })
    }

    /* process incoming received message and proof */
    public async processIncomingMessage(msgBuf: MessageV0) { // TODO get typing correct
        if (!msgBuf.payload) return
        const chatMessage = ChatMessage.decodeMessage(msgBuf)
        if (!chatMessage) return
        
        try {
            const { message, epoch, rln_proof, alias } = chatMessage
            const timestamp = new Date().setTime(Number(epoch) * 1000)
    
            let proofState, proofResult
            if (!rln_proof) {
                console.log('No Proof with Message')
                proofState = ProofState.none
            } else {
                proofState = ProofState.processing
                console.log(`Proof attached: ${rln_proof}`)
                proofResult = await this.rlnInstance.verifyProof(rln_proof)
                if (proofResult) {
                    proofState = ProofState.verified
                    this.updateChatStore([chatMessage])
                }
                // TODO: at some point, add proofs to a proof store with state
                // return { message, epoch, rln_proof, proofState }
            }
            console.log(`Message Received from ${alias}: ${message}, sent at ${timestamp}`)
        } catch(e) {
            console.log('Error receiving message')
        }
    }

    public async retrieveMessageStore(timePeriod?: TimePeriod) {
        const {startTime, endTime } = getDates(timePeriod ?? TimePeriod.Week)
        if (!this.waku) return
        try {
            for await (const msgPromises of this.waku.store.queryGenerator([this.decoder], {timeFilter: {startTime, endTime}})) {
                const wakuMessages = await Promise.all(msgPromises)
                const messages: ChatMessage[] = []

                wakuMessages.map((wakuMsg) => ChatMessage.decodeMessage(wakuMsg))
                .forEach((msg) => {if (msg) { messages.push(msg) }})
                
                this.updateChatStore(messages)
            }
        } catch (e) {
            console.log("Failed to retrieve messages", e);
        }
    }
}

