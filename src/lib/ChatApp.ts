import { Message, Waku } from "js-waku/lib/interfaces"
import { DecoderV0, EncoderV0 } from "js-waku/dist/lib/waku_message/version_0"
import { Web3Provider } from '@ethersproject/providers'
import { createWaku } from "../utils/createWaku"
import { ChatMessage } from "../types/proto"
import RLNRegistry from "../../rlnjs/src/registry/RLNRegistry"
import { ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, genExternalNullifier } from "../../rlnjs/src/utils"
import { RLN } from "../../rlnjs/src"
import { ChatRoom } from "./ChatRoom"
import detectEthereumProvider from '@metamask/detect-provider'
import { UserID } from "../types/UserID"
import { RoomType } from "../types/ChatRoomOptions"

export enum RegistrationType {
  ENS = 'ENS',
  address = 'address',
  anon = 'anon',
  interep = 'interep'
}

export type ChatMessageStore = {
  contentTopic: string
  msgs: Message[]
}

export class ChatApp {
    protected appName: string
    protected waku: Waku | undefined
    protected provider: Web3Provider | undefined
    protected chatMessageStores: Record<string, ChatMessageStore>
    protected observers: { callback : (msg: Message) => void; topics: string[] }[] = []
    protected registry: RLNRegistry
    protected identityCommitments: bigint[]
    protected deleteObserver?: (() => void)

    public constructor(
        appName: string,
        waku?: Waku,
        provider?: Web3Provider,
      ) {
        this.appName = appName
        this.waku = waku
        this.provider = provider
        this.registry = new RLNRegistry()
        this.identityCommitments = []

        for (const name in this.chatMessageStores) {
          const chatStore: ChatMessageStore = { contentTopic: `/${this.appName}/0.0.1/${name}/proto/`, msgs: [] }
          this.chatMessageStores[name] = chatStore
        }
        this.setObserver()
      }

      /* set up Waku Observer for chat */
      protected async setObserver() {
        this.waku = await createWaku();
        await Promise.all(
          Object.values(this.chatMessageStores).map(async (msgObj) => {
            const decoder = new DecoderV0(msgObj.contentTopic)
            // TODO: leave here?
            await this.waku?.store?.queryCallbackOnPromise([decoder], async (msgPromise) => {
              const msg = await msgPromise;
              if (msg) this.chatMessageStores[msgObj.contentTopic].msgs.push(msg);
            })
            this.deleteObserver = this?.waku?.relay?.addObserver(decoder, this.processIncomingMessage)
          })
        )
      }

      /* delete registered observers on relay */
      public cleanUpObservers() {
        if (this.deleteObserver) this.deleteObserver()
        this.chatMessageStores = {}
      }

      /* send a message */
      public async sendMessage(user: UserID, message: string, waku: Waku, timestamp: Date, contentTopic: string) {
        const time = timestamp.getTime(); 
        const protoMsg = ChatMessage.create({
            payload: message,
            timestamp: time,
            contentTopic: contentTopic,
            rate_limit_proof: this.generateRLNProof(user)
        });
        const payload = ChatMessage.encode(protoMsg).finish()
        const Encoder = new EncoderV0(contentTopic)
        await waku.relay?.send(Encoder, { payload, timestamp }).then(() => {
          console.log(`Sent Encoded Message: ${protoMsg}`)
        })
      }
  
    /* decode an incoming message */
    protected async processIncomingMessage(msgBuf: Message) {
      if (!msgBuf.payload || ChatMessage.verify(msgBuf)) return;
      
      try {
        const { payload, contentTopic, timestamp, rateLimitProof } = ChatMessage.decode(msgBuf.payload);
        console.log(`Message Received: ${payload}, sent at ${timestamp.toString()} with content topic ${contentTopic} 
          and rln proof ${rateLimitProof}`)
        // TODO: fix this not indexing correctly
        // this.chatMessageStores[contentTopic].msgs.push({ payload, contentTopic, timestamp, rateLimitProof });
      } catch(e) {
        console.log('error receiving message')
      }
      
    }

    /*
    * USER REGISTRATION: add user to chatApp
    * usage in frontend: could have options for registration level aka
    * button, name register, etc.
    */
    public async userRegistration(registrationType: RegistrationType): Promise<UserID> {
      const identity = new ZkIdentity()
      const identityCommitment = identity.genIdentityCommitment()
      const newUserID: UserID = { identity, identityCommitment, registrationLevel: registrationType }

      /* anon: only use zk id */
      if (registrationType === RegistrationType.anon) {
        console.log('Anon identity registered')
      } 
      /* address/ens: use wallet address */
      else {
        this.provider = await detectEthereumProvider()

        if (this.provider) {
          await this.provider.send("eth_requestAccounts", [])
          const signer = this.provider.getSigner()
          newUserID.address = await signer.getAddress()
          console.log("Ethereum detected! Account: ", newUserID.address)

          if (registrationType === RegistrationType.ENS) {
            const ENS = await this.provider.lookupAddress(signer.getAddress())
            newUserID.ENS = ENS
          }
        } else {
          console.log("Please install Ethereum provider to register with address")
        }    
      }

      this.identityCommitments.push(identityCommitment) 
      this.registry.addMember(identityCommitment)
      return newUserID
    }

    /* Generate RLN proof */
    public async generateRLNProof(user: UserID) {
      const secretHash = user.identity.getSecretHash()

      const leaves = Object.assign([], this.identityCommitments)
      leaves.push(user.identityCommitment)

      const signal = "signal"
      const epoch = genExternalNullifier("test-epoch")
      const rlnIdentifier = RLN.genIdentifier()

      const merkleProof = await generateMerkleProof(15, BigInt(0), leaves, user.identityCommitment)
      const witness = RLN.genWitness(secretHash, merkleProof, epoch, signal, rlnIdentifier)

      // TODO UPDATE THESE
      var wasmFilePath, finalZkeyPath;
      const fullProof = await RLN.genProof(witness, wasmFilePath, finalZkeyPath)
      return fullProof
    }

    /* create chat room */
    public createChatRoom(name: string, roomType: RoomType) {
      if (name in this.chatMessageStores) {
        return 'Error: Please choose different chat name.'
      }
      const contentTopic = `/${this.appName}/0.0.1/${roomType}-${name}/proto/`
      return new ChatRoom(contentTopic, roomType)
    }

    // TODO: add decoder?
    public async fetchChatRoomMsgs(name: string) {
      const msgs = this.chatMessageStores[name]
    }
  }
