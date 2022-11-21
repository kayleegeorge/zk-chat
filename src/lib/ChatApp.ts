import { Message, Waku } from "js-waku/lib/interfaces"
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0"
// var DecoderV0 = require('js-waku/lib/waku_message/version_0')
// var EncoderV0 = require('js-waku/lib/waku_message/version_0')
//var createWaku = require('../utils/createWaku')
//var ChatMessage = require('../types/proto')
import { Web3Provider } from '@ethersproject/providers'
import { createWaku } from "../utils/createWaku"
import { ChatMessage } from "../types/proto"
import RLNRegistry from "../../rlnjs/src/registry/RLNRegistry"
import { ethers } from "ethers"
import { ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, genExternalNullifier } from "../../rlnjs/src/utils"
import { RLN } from "../../rlnjs/src"
// import detectEthereumProvider from '@metamask/detect-provider'

export enum RegistrationType {
  ENS = 'ENS',
  address = 'address',
  anon = 'anon'
}

type ChatMessageStore = {
  contentTopic: string
  msgs: Message[]
}

export class ChatApp {
    protected appName: string
    protected waku: Waku | undefined
    protected provider: Web3Provider | undefined
    protected chatMessageStores: Record<string, ChatMessageStore> //Map<string, {contentTopic: string, msgs: Message[]}>
    protected observers: { callback : (msg: Message) => void; topics: string[] }[] = [] // need observers to receive
    protected registry: RLNRegistry
    protected deleteObserver?: (() => void)

    public constructor(
        appName: string,
        chainId: number,
        waku?: Waku,
        provider?: Web3Provider,
      ) {
        this.appName = appName
        this.waku = waku
        this.provider = provider
        this.registry = new RLNRegistry() // create registry for app (or should this go in chatroom)

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
      public cleanUpObservers() {
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
      
    }

    /*
    * usage in frontend: could have options for registration level aka
    * button, name register, etc.
    */
    public async userRegistration(registrationType: RegistrationType) {
      let identity
      // anon: generate zk id for them 
      if (registrationType === RegistrationType.anon) {
        // const anonIdentity = generateAnonIdentity()
        console.log('Anon identity registered')
      } 
      // address/ens: use wallet address 
      else {
        // this.provider = await detectEthereumProvider()

        if (this.provider) {
          await this.provider.send("eth_requestAccounts", [])
          const signer = this.provider.getSigner()
          console.log("Ethereum detected! Account: ", await signer.getAddress())

          // lookup ENS
          await this.provider.lookupAddress(signer.getAddress())

        } else {
          console.log("Please install Ethereum provider to register with address")
        }    
      }
      
      // after identity construction, add to registry
      if (identity) {
        identity = new ZkIdentity()
        const identityCommitment = identity.genIdentityCommitment()
        this.registry.addMember(identityCommitment)
      }
    }

    public async generateRLNProof(identity: ZkIdentity, identityCommitment: bigint, identityCommitments: any) {
      const secretHash = identity.getSecretHash()

      const leaves = Object.assign([], identityCommitments)
      leaves.push(identityCommitment)

      const signal = "signal"
      const epoch = genExternalNullifier("test-epoch")
      const rlnIdentifier = RLN.genIdentifier()

      const merkleProof = await generateMerkleProof(15, BigInt(0), leaves, identityCommitment)
      const witness = RLN.genWitness(secretHash, merkleProof, epoch, signal, rlnIdentifier)

      // TODO UPDATE THESE
      var wasmFilePath, finalZkeyPath;
      const fullProof = await RLN.genProof(witness, wasmFilePath, finalZkeyPath)
    }
  }
