import { WakuLight } from "js-waku/lib/interfaces"
import { Web3Provider } from '@ethersproject/providers'
import { ChatRoom } from "./ChatRoom"
import { RoomType } from "../types/ChatRoomOptions"
import { checkChain, GOERLI } from "../utils/checkChain"
import { Contract } from "ethers"
import { Identity } from "@semaphore-protocol/identity"
import { RLN, RLNMember } from "./RLN"

export class ChatApp {
    protected appName: string
    protected chatRoomStore: Record<string, ChatRoom>
    protected rln: RLN
    protected provider: Web3Provider

    public constructor(
        appName: string,
        provider: Web3Provider,
        rln: RLN
      ) {
        this.appName = appName
        this.provider = provider
        this.rln = rln
    
        this.chatRoomStore = {}
      }

    // ref: https://semaphore.appliedzkp.org/docs/guides/identities
    /* identity generation without RLN */
    public createIdentity() {
      const identity = new Identity()
      return identity
    }

    /* app-level user registration: add user to chatApp and RLN registry */
    public async registerUser(existingIdentity?: string) {
      this.rln.constructRLNMemberTree() 
      const rlnMember = new RLNMember(this.rln, existingIdentity)
      await rlnMember.registerUserOnRLNContract(this.provider)
      return rlnMember
    }

    /* create chat room */
    public createChatRoom(name: string, roomType: RoomType, rlnMember: RLNMember, chatMembers: string[]) {
      const contentTopic = `/${this.appName}/0.0.1/${roomType}-${name}/proto/`
      if (contentTopic in this.chatRoomStore) {
        console.log('Error: Please choose different chat name.')
      }
      if (chatMembers) {
        const chatroom = new ChatRoom(contentTopic, roomType, this.provider, rlnMember, chatMembers, this.rln)
        this.chatRoomStore[contentTopic] = chatroom
        return chatroom
      } else {
        console.log("You must register as a user before creating a chat room.")
      }
    }

    /* fetch all chat room messages for a given chatroom */
    public async fetchChatRoomMsgs(name: string) {
      return this.chatRoomStore[name].getAllMessages()
    }
  }
