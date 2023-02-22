import { WakuLight } from 'js-waku/lib/interfaces'
//import { Decoder } from 'js-waku/lib/interfaces'
// import { UnsubscribeFunction } from 'js-waku/lib/waku_filter/index'
import RLN from './RLN'
import { ChatMessage } from './types/ChatMessage'
import { dateToEpoch, strToArr } from './utils/formatting'
import { DecoderV0, EncoderV0, MessageV0 } from 'js-waku/lib/waku_message/version_0'
import { getDates, TimePeriod } from './utils/getDates'
import { createWakuNode } from './utils/createWakuNode'

enum ConnectionStatus {
  ready = 'ready',
  connecting = 'connecting',
  disconnected = 'disconnected',
}

type ContentTopicFunctions = {
  encoder: EncoderV0,
  decoder: DecoderV0,
  unsubscribe?: () => Promise<void>
}

/* Connecting with Waku as networking layer */
class WakuConnection {
  public waku: WakuLight | undefined

  public contentTopicFunctions: Map<string, ContentTopicFunctions>

  //public updateChatStore: (value: ChatMessage[]) => void

  // public chatStore: ChatMessage[] // store
  private rlnInstance: RLN

  // updateChatStore: (value: ChatMessage[]) => void
  constructor(rlnInstance: RLN) {
    this.rlnInstance = rlnInstance
    this.contentTopicFunctions = new Map()
  }

  /* subscribe to a certain contentTopic and add content topic functions */
  public async subscribe(contentTopic: string) {
    const decoder = new DecoderV0(contentTopic)
    const unsubscribe = await this.waku?.filter.subscribe([decoder], this.processIncomingMessage)

    const functions: ContentTopicFunctions = {
      encoder: new EncoderV0(contentTopic),
      decoder: decoder,
      unsubscribe: unsubscribe
    }
    this.contentTopicFunctions.set(contentTopic, functions)
  }

  /* unsubscribe from a given room / content topic */
  public async unsubscribe(contentTopic: string) {
    const unsub = this.contentTopicFunctions.get(contentTopic)?.unsubscribe
    if (unsub) await unsub()
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
    const encoder = this.contentTopicFunctions.get(contentTopic)?.encoder
    if (!this.waku || !encoder) {
      throw new Error('waku not connected')
    }
    await this.waku.lightPush.push(encoder, { payload }).then((msg) => {
      console.log(`Sent Encoded Message: ${msg}`)
    })
  }

  /* process incoming received message and proof */
  public async processIncomingMessage(msgBuf: MessageV0) { // TODO get typing correct
    if (!msgBuf.payload) return
    const chatMessage = ChatMessage.decodeWakuMessage(msgBuf)
    if (!chatMessage) return

    try {
      const { message, epoch, rlnProof, alias } = chatMessage
      const timestamp = new Date().setTime(Number(epoch) * 1000)

      let proofResult
      if (!rlnProof) {
        console.log('No Proof with Message')
      } else {
        console.log(`Proof attached: ${rlnProof}`)
        proofResult = await this.rlnInstance.verifyProof(rlnProof)
        if (proofResult) {
          //this.updateChatStore([chatMessage])
          this.rlnInstance.addProofToCache(rlnProof) // add proof to RLN cache on success
        }
      }
      console.log(`Message Received from ${alias}: ${message}, sent at ${timestamp}`)
    } catch (e) {
      console.log('Error receiving message')
    }
  }

  /* get all previous messages */ 
  public async retrieveMessageStore(contentTopic: string, timePeriod?: TimePeriod) {
    const decoder = this.contentTopicFunctions.get(contentTopic)?.decoder
    const messages: ChatMessage[] = []
    const { startTime, endTime } = getDates(timePeriod ?? TimePeriod.Week)
    
    if (!this.waku || !decoder) return
    try {
      for await (const msgPromises of this.waku.store.queryGenerator([decoder], { timeFilter: { startTime, endTime } })) {
        const wakuMessages = await Promise.all(msgPromises)
        
        wakuMessages.map((wakuMsg) => ChatMessage.decodeWakuMessage(wakuMsg))
          .forEach((msg) => {if (msg) { messages.push(msg) }})
      }
    } catch (e) {
      console.log('Failed to retrieve messages', e)
    }
    return messages
  }
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

    const rawMessage = { message: text, epoch: dateToEpoch(date) }
    const rlnProof = await this.rlnInstance.generateRLNProof(rawMessage.message, rawMessage.epoch)

    const protoMsg = new ChatMessage({
      message: strToArr(text),
      epoch: dateToEpoch(date),
      rlnProof: rlnProof,
      alias,
    })
    const payload = protoMsg.encode() // encode to proto
    this.connectionInstance.sendMessage(payload, roomName)
  }

  public async retrieveMessageStore(contentTopic: string) {
    this.connectionInstance.retrieveMessageStore(contentTopic)
  }

}

