import { Decoder, Encoder, Message, Waku } from "js-waku/lib/interfaces";
import { WakuMessagesSetup } from '../types/WakuMessagesSetup'
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0";
import { ChatMessage, proto } from "../types/ChatMessage";
import { Web3Provider } from '@ethersproject/providers';
import { createWaku } from "../utils/createWaku";

// to store the messages
type WakuMessageStore = {
    contentTopic: string
    hashMap: { [id: string]: boolean }
    msgs: Message[]
    updateFunction: (msg: Message[]) => void;
}

type WakuMessageStores = {
    [messageType: string]: WakuMessageStore
}

export class zkChat {
    protected appName: string
    protected waku: Waku | undefined
    protected chainId = 0
    protected provider: Web3Provider | undefined
    protected wakuMessages: WakuMessageStores = {}
    protected observers: { callback : (msg: Message) => void; topics: string[] }[] = [] // need observers to receive
    protected deleteObserver: (() => void) | undefined 

    protected constructor(
        appName: string,
        chainId: number,
        wakuMessagesSetup: WakuMessagesSetup<any>[],
        waku?: Waku,
        provider?: Web3Provider
      ) {
        this.appName = appName
        this.waku = waku
        this.chainId = chainId
        this.provider = provider
        wakuMessagesSetup.forEach((setupData) => {
          this.wakuMessages[setupData.name] = {
            contentTopic: `/${this.appName}/0.0.1/${setupData.name}/proto/`,
            hashMap: {},
            msgs: [],
            updateFunction: (msg) => this.decodeAndSetArray(msg, setupData)
          }
        })
        this.setObserver()
      }

      protected async setObserver() {
        this.waku = await createWaku();

        await Promise.all(
          Object.values(this.wakuMessages).map(async (msgObj) => {
            const decoder = new DecoderV0(msgObj.contentTopic)
            if (!decoder) return;
            await this.waku?.store?.queryCallbackOnPromise([decoder], async (msgPromise) => {
              const msg = await msgPromise;
              if (msg) this.wakuMessages[msgObj.contentTopic].msgs.push(msg);
            })
            // addObserver returns deleteObserver function
            this.deleteObserver = this?.waku?.relay?.addObserver(decoder, (msg) => msgObj.updateFunction([msg]),)
            this.observers.push({ callback: (msg) => msgObj.updateFunction([msg]), topics: [msgObj.contentTopic]})
          })
        )
      }

      // delete registered observers on relay
      public cleanUp() {
        if (this.deleteObserver) this.deleteObserver();
        this.wakuMessages = {};
      }

      protected decodeAndSetArray<T extends { id: string; timestamp: Date }>(messages: Message[], setupData: WakuMessagesSetup<T>) {
        const { decodeFunction, filterFunction, name } = setupData
        const {msgs, hashMap } = this.wakuMessages[name]
        const decodedMessages = messages.map(decodeFunction).filter((e): e is T => !!e)

        decodedMessages
        .sort((a, b) => ((a?.timestamp ?? new Date(0)) > (b?.timestamp ?? new Date(0)) ? 1 : -1))
        .forEach((e) => {
          if (e) {
            if (filterFunction ? filterFunction(e) : true) {
              if (!hashMap?.[e.id]) {
                // msgs.unshift(e) -- figure out what this does
                hashMap[e.id] = true
              }
            }
          }
        })
      }

      // send a message
    protected async sendMessage(message: string, waku: Waku, timestamp: Date, msgStore: WakuMessageStore) {
      const time = timestamp.getTime();
    
      // Encode to protobuf
      const protoMsg = ChatMessage.create({
          message: message,
          epoch: time,
          // insert RLN proof 
      });
      const payload = ChatMessage.encode(protoMsg).finish();
      const Encoder = new EncoderV0(msgStore.contentTopic);
      await waku.relay?.send(Encoder, { payload });
    }
  
    // decode an incoming message 
    protected async processIncomingMessage(wakuMessage: Message) {
      // No need to attempt to decode a message if the payload is absent
      if (!wakuMessage.payload) return;
    
      const { message, epoch, rln_proof } = proto.ChatMessage.decode(wakuMessage.payload);
      console.log(`Message Received: ${message}, sent at ${epoch.toString()} with rln proof ${rln_proof}`);
    };
  }
