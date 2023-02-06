import { Decoder, WakuLight } from "js-waku/lib/interfaces";
import { UnsubscribeFunction } from "js-waku/lib/waku_filter";
import { RLN } from "./RLN";
import { ChatMessage } from "./types/ChatMessage";
import { dateToEpoch, utf8ToBytes } from "./utils/formatting";
import { DecoderV0, EncoderV0, MessageV0 } from "js-waku/lib/waku_message/version_0";
import { getDates, TimePeriod } from "./utils/getDates";
import { createWakuNode } from "./utils/createWakuNode";

enum ConnectionStatus {
    ready = 'ready',
    connecting = 'connecting',
    disconnected = 'disconnected'
}

type ContentTopicFunctions = {
    encoder: EncoderV0,
    decoder: DecoderV0,
    unsubscribe: UnsubscribeFunction
}

/* note: can use this class to add more connection types in the future */
export class Connection {
    public connectionStatus: ConnectionStatus 
    private connectionInstance: WakuConnection 
    private rlnInstance: RLN

    constructor(rlnInstance: RLN) {
        this.connectionStatus = ConnectionStatus.disconnected
        this.rlnInstance = rlnInstance
        this.connectionInstance = new WakuConnection(rlnInstance)
    }

    public connect() {
        this.connectionInstance.connect()
    }

    public disconnect() {
        this.connectionInstance.disconnect()
    }

    public subscribeToRoom(contentTopic: string) {
        this.connectionInstance.subscribe(contentTopic)
    }
    public unsubscribeFromRoom(contentTopic: string) {
        this.connectionInstance.unsubscribe(contentTopic) 
    }

    /* send message by encoding to protobuf -> payload for waku message */ 
    public async sendMessage(text: string, alias: string, roomName: string) {
        const date = new Date()

        const rawMessage = { message: text, epoch: dateToEpoch(date)} 
        const rln_proof = await this.rlnInstance.generateRLNProof(rawMessage.message, rawMessage.epoch)
        
        const protoMsg = new ChatMessage({
            message: utf8ToBytes(text),
            epoch: dateToEpoch(date), 
            rln_proof: rln_proof,
            alias,
        })
        const payload = protoMsg.encode() // encode to proto
        this.connectionInstance.sendMessage(payload, roomName)
    }

    public async retrieveMessageStore(contentTopic: string) {
        this.connectionInstance.retrieveMessageStore(contentTopic)
    }

}

/* Connecting with Waku as networking layer */
class WakuConnection {
    public waku: WakuLight | undefined
    public contentTopicFunctions: Map<string, ContentTopicFunctions>
    public updateChatStore: (value: ChatMessage[]) => void
    // public chatStore: ChatMessage[] // store 
    private rlnInstance: RLN

    // updateChatStore: (value: ChatMessage[]) => void
    constructor(rlnInstance: RLN) {
        this.rlnInstance = rlnInstance
        this.contentTopicFunctions = new Map()
        // this.updateChatStore = updateChatStore

    }

    /* subscribe to a certain contentTopic and add content topic functions */
    public async subscribe(contentTopic: string) {
        const decoder = new DecoderV0(contentTopic)
        this.contentTopicFunctions[contentTopic].decoder = decoder
        this.contentTopicFunctions[contentTopic].encoder = new EncoderV0(contentTopic)
        const unsubscribe = await this.waku?.filter.subscribe([decoder], this.processIncomingMessage)
        this.contentTopicFunctions[contentTopic].unsubscribe = unsubscribe
    }

    /* unsubscribe from a given room / content topic */
    public async unsubscribe(contentTopic: string) {
        const unsub = this.contentTopicFunctions[contentTopic].unsubscribe 
        await unsub()
    }

    /* connect to a waku node */
    public async connect() {
        this.waku = await createWakuNode()
    }

    /* disconnect waku node */
    public async disconnect() {
        try { 
            await this.waku?.stop()
        } catch (e) {
            console.log('failed to stop waku')
        }
        
    }

    /* send a message using Waku */
    public async sendMessage(payload: Uint8Array, contentTopic: string) {
        if (!this.waku) {
            throw new Error('waku not connected')
        }
        const encoder = this.contentTopicFunctions[contentTopic].encoder
        await this.waku.lightPush.push(encoder, { payload }).then((msg) => {
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
    
            let proofResult
            if (!rln_proof) {
                console.log('No Proof with Message')
            } else {
                console.log(`Proof attached: ${rln_proof}`)
                proofResult = await this.rlnInstance.verifyProof(rln_proof)
                if (proofResult) {
                    this.updateChatStore([chatMessage])
                    this.rlnInstance.addProofToCache(rln_proof) // add proof to RLN cache on success
                }
            }
            console.log(`Message Received from ${alias}: ${message}, sent at ${timestamp}`)
        } catch(e) {
            console.log('Error receiving message')
        }
    }

    public async retrieveMessageStore(contentTopic: string, timePeriod?: TimePeriod) {
        const decoder = this.contentTopicFunctions[contentTopic].decoder
        const {startTime, endTime } = getDates(timePeriod ?? TimePeriod.Week)
        if (!this.waku) return
        try {
            for await (const msgPromises of this.waku.store.queryGenerator([decoder], {timeFilter: {startTime, endTime}})) {
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
