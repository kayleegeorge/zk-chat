import { Message, Waku, WakuLight } from "js-waku/lib/interfaces"
import { DecoderV0, EncoderV0 } from "js-waku/lib/waku_message/version_0";
import { Web3Provider } from '@ethersproject/providers'
import { createWakuNode } from "../utils/createWaku"
import { ChatRoom } from "./ChatRoom"
import detectEthereumProvider from '@metamask/detect-provider'
import { UserID } from "../types/UserID"
import { RoomType } from "../types/ChatRoomOptions"
import * as rln from "@waku/rln"

// future
// export enum RegistrationType {
//   ENS = 'ENS',
//   address = 'address',
//   anon = 'anon',
//   interep = 'interep'
// }

export class ChatApp {
    protected appName: string
    protected waku: WakuLight | undefined
    protected provider: Web3Provider | undefined
    protected chatRoomStore: Record<string, ChatRoom>
    protected rlnInstance: rln.RLNInstance

    public constructor(
        appName: string,
        waku?: WakuLight,
        provider?: Web3Provider,
      ) {
        this.appName = appName
        this.waku = waku
        this.provider = provider
        
        this.chatRoomStore = {}
        this.init()

      }

      public async init() {
        this.waku = await createWakuNode();
        this.rlnInstance = await rln.create()
      }

    /*
    * user registration: add user to chatApp & RLN registry
    */
    public async userRegistration(memKeys?: rln.MembershipKey): Promise<UserID> {
      const memberKeys = memKeys ?? this.rlnInstance.generateMembershipKey() // IDKey, IDcommitment
      this.rlnInstance.insertMember(memberKeys.IDCommitment)
      const newUserID: UserID = { memberKeys }

      /* get eth pubkey wallet address */
      this.provider = await detectEthereumProvider()

      if (this.provider) {
        await this.provider.send("eth_requestAccounts", [])
        const signer = this.provider.getSigner()
        newUserID.address = await signer.getAddress()
        console.log("Ethereum detected! Account: ", newUserID.address)
      } else {
        console.log("Please install Ethereum provider to register with address")
      }    
      return newUserID
    }

    /* create chat room */
    public createChatRoom(name: string, roomType: RoomType) {
      const contentTopic = `/${this.appName}/0.0.1/${roomType}-${name}/proto/`
      if (contentTopic in this.chatRoomStore) {
        return 'Error: Please choose different chat name.'
      }
      const chatroom = new ChatRoom(contentTopic, roomType, this.waku)
      this.chatRoomStore[contentTopic] = chatroom
      return chatroom
    }

    public async fetchChatRoomMsgs(name: string) {
      const msgs = this.chatRoomStore[name].getMessages()
      return msgs
    }
  }
