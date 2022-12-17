import { createLibp2p } from "libp2p/dist/src";
import {  WakuLight } from "js-waku/lib/interfaces";
import { UnsubscribeFunction } from "js-waku/lib/waku_filter";
// import { DecoderV0, EncoderV0 } from "../types/Coders";
import { RLN, RLNMember } from "./RLN";
import { ChatMessage } from "../types/ChatMessage";
import { dateToEpoch } from "../utils/formatting";
import { IProtoMessage, rlnDecoder, rlnEncoder } from "../types/Coders";
import { utf8ToBytes } from "js-waku/lib/utils";
import { Message } from "../types/Message";

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
    private connectionInstance: any
    private rlnMember: RLNMember
    private rlnInstance: RLN

    constructor(connectionMethod: ConnectionMethod, rlnInstance: RLN, rlnMember: RLNMember, contentTopic?: string) {
        this.connectionMethod = connectionMethod
        this.rlnMember = rlnMember
        this.rlnInstance = rlnInstance
        
        switch(this.connectionMethod) {
            case ConnectionMethod.Libp2p:
                this.connectionInstance = new Libp2pConnection()
            case ConnectionMethod.Waku:
                if (contentTopic) this.connectionInstance = new WakuConnection(contentTopic)
        }

    }

    public connect() {
        this.connectionInstance.connect()
    }

    public disconnect() {
        this.connectionInstance.disconnect()
    }

    public async sendMessage(text: string, alias: string) {
        const date = new Date()

        const rawMessage = { message: text, epoch: dateToEpoch(date)} 
        const rln_proof = await this.rlnMember.generateProof(rawMessage)
        
        // encode to protobuf
        const protoMsg = new ChatMessage({
            message: utf8ToBytes(text),
            epoch: dateToEpoch(date),
            rln_proof, 
        })
        const payload = protoMsg.encode()
        this.connectionInstance.sendMessage(payload)
    }

    /* process incoming received message and proof */
    public async processReceivedMessage(msgBuf: IProtoMessage) { // get typing correct
        if (!msgBuf.payload) return
        const chatMessage = Message.fromWakuMessage(msgBuf)
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
                if (proofResult) proofState = ProofState.verified
                return { message, epoch, rln_proof, proofState }
            }
            console.log(`Message Received from ${alias}: ${message}, sent at ${timestamp}`)
        } catch(e) {
            console.log('Error receiving message')
        }
    }
}

class Libp2pConnection {
    constructor() {
        
    }

    public async connect(_options?) {
        const node = await createLibp2p(_options)
        await node.start()
    }
}

class WakuConnection {
    public waku: WakuLight 
    public disconnect: UnsubscribeFunction
    private decoder: rlnDecoder
    private encoder: rlnEncoder
    private contentTopic: string

    constructor(contentTopic: string) {
        this.contentTopic = contentTopic
        this.decoder = new rlnDecoder(this.contentTopic)
        this.encoder = new rlnEncoder(this.contentTopic)
    }

    public async connect(processMsgCallback: () => void) {
        this.disconnect = await this.waku.filter.subscribe([this.decoder], processMsgCallback)
    }

    /* send a message using Waku */
    public async sendMessage(payload: Uint8Array) {
        const result = await this.waku.lightPush.push(this.encoder, { payload }).then(() => {
            console.log(`Sent Encoded Message: ${result}`)
        })
    }
}

