import { Message, Waku } from "js-waku/lib/interfaces";
import { WakuMessagesSetup } from '../types/WakuMessagesSetup'
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0";
import { ChatMessage, proto } from "../types/ChatMessage";

// to store the messages
type WakuMessageStore = {
    contentTopic: string
    hashMap: { [id: string]: boolean }
    arr: any[]
}

type WakuMessageStores = {
    [messageType: string]: WakuMessageStore
}

export class zkChat {
    protected appName: string
    protected waku: Waku | undefined
    protected chainId = 0
    protected wakuMessages: WakuMessageStores = {}

    protected constructor(
        appName: string,
        chainId: number,
        wakuMessagesSetup: WakuMessagesSetup<any>[],
        waku?: Waku
      ) {
        this.appName = appName
        this.waku = waku
        this.chainId = chainId
        wakuMessagesSetup.forEach((setupData) => {
          this.wakuMessages[setupData.name] = {
            contentTopic: `/${this.appName}/0.0.1/${setupData.name}/proto/`,
            hashMap: {},
            arr: [],
          }
        })

      }

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

  protected async processIncomingMessage(wakuMessage: Message) {
    // No need to attempt to decode a message if the payload is absent
    if (!wakuMessage.payload) return;
  
    const { message, epoch, rln_proof } = proto.ChatMessage.decode(wakuMessage.payload);
  
    console.log(`Message Received: ${message}, sent at ${epoch.toString()} with rln proof ${rln_proof}`);
  };
}
