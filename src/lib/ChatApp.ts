import { Message, Waku } from "js-waku/lib/interfaces"
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0"
import { Web3Provider } from '@ethersproject/providers'
import { createWaku } from "../utils/createWaku"
import { ChatMessage } from "../types/proto"


type ChatMessageStore = {
  contentTopic: string
  msgs: Message[]
}

export class ChatApp {
    protected appName: string
    protected waku: Waku | undefined
    protected chainId = 0
    protected provider: Web3Provider | undefined
    protected chatMessageStores: Record<string, ChatMessageStore> //Map<string, {contentTopic: string, msgs: Message[]}>
    protected observers: { callback : (msg: Message) => void; topics: string[] }[] = [] // need observers to receive
    protected deleteObserver?: (() => void)

    public constructor(
        appName: string,
        chainId: number,
        waku?: Waku,
        provider?: Web3Provider,
      ) {
        this.appName = appName
        this.waku = waku
        this.chainId = chainId
        this.provider = provider

        for (const name in this.chatMessageStores) {
          const chatStore: ChatMessageStore = { contentTopic: `/${this.appName}/0.0.1/${name}/proto/`, msgs: [] }
          this.chatMessageStores[name] = chatStore
        }
        this.setObserver()
      }

      protected async setObserver() {
        this.waku = await createWaku();
        await Promise.all(
          Object.values(this.chatMessageStores).map(async (msgObj) => {
            const decoder = new DecoderV0(msgObj.contentTopic)
            if (!decoder) return;
            await this.waku?.store?.queryCallbackOnPromise([decoder], async (msgPromise) => {
              const msg = await msgPromise;
              if (msg) this.chatMessageStores[msgObj.contentTopic].msgs.push(msg);
            })
            this.deleteObserver = this?.waku?.relay?.addObserver(decoder, this.processIncomingMessage)
          })
        )
      }

      // delete registered observers on relay
      public cleanUp() {
        if (this.deleteObserver) this.deleteObserver()
        this.chatMessageStores = {}
      }

      // send a message
    public async sendMessage(message: string, waku: Waku, timestamp: Date, contentTopic: string) {
      const time = timestamp.getTime(); 
      const protoMsg = ChatMessage.create({
          payload: message,
          timestamp: time,
          contentTopic: contentTopic
          // insert RLN proof 
      });
      const payload = ChatMessage.encode(protoMsg).finish()
      const Encoder = new EncoderV0(contentTopic)
      await waku.relay?.send(Encoder, { payload, timestamp }).then(() => {
        console.log(`Sent Encoded Message: ${protoMsg}`)
      })
    }
  
    // decode an incoming message 
    protected async processIncomingMessage(msgBuf: Message) {
      // No need to attempt to decode a message if the payload is absent
      if (!msgBuf.payload || ChatMessage.verify(msgBuf)) return;
      
      try {
        const { payload, contentTopic, timestamp, rateLimitProof }= ChatMessage.decode(msgBuf.payload);
        console.log(`Message Received: ${payload}, sent at ${timestamp.toString()} with content topic ${contentTopic} 
          and rln proof ${rateLimitProof}`)
        // TODO: fix this not indexing correctly
        // this.chatMessageStores[contentTopic].msgs.push({ payload, contentTopic, timestamp, rateLimitProof });
      } catch(e) {
        console.log('error receiving message')
      }
      
    };
  }
