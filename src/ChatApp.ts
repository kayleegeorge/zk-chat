import { Web3Provider } from '@ethersproject/providers'
import { ChatRoom } from "./ChatRoom"
import { RoomType } from "./types/ChatRoomOptions"
import { Identity } from "@semaphore-protocol/identity"
import { RLN } from "./RLN"
import { Connection } from './Connection'

export default class ChatApp {
    public appName: string
    public chatRoomStore: Map<string, ChatRoom>
    public rln: RLN
    public provider: Web3Provider | undefined
    public connection: Connection

    public constructor(
        appName: string,
        provider?: Web3Provider,
        existingIdentity?: string,
        rlnIdentifier?: bigint
      ) {
        this.appName = appName // also contentTopic for Waku connection
        this.provider = provider

        this.rln = new RLN(existingIdentity, rlnIdentifier) // might need to pass provider?
        this.connection = new Connection(this.rln)
    
        this.chatRoomStore = new Map<string, ChatRoom>()
      }

    // ref: https://semaphore.appliedzkp.org/docs/guides/identities
    /* identity generation without RLN */
    public createIdentity() {
      const identity = new Identity()
      console.log(identity)
      return identity
    }

    /* app-level user registration: add user to chatApp and RLN registry */
    public async registerUser() {
      this.rln.constructRLNMemberTree() 
      if (this.provider) await this.rln.registerUserOnRLNContract(this.provider) // TODO: maybe this not needed? investigate
      return this.rln.rlnjs.identity
    }

    /* create chat room */
    public createChatRoom(name: string, roomType: RoomType, chatMembers: string[]) {
      let chatRoomName = `/${this.appName}/${roomType}-${name}/`
      // no duplicate chat room names
      let i = 0
      while (chatRoomName + i.toString() in this.chatRoomStore) {
        i += 1
      }
      chatRoomName += i.toString()
      if (chatMembers.length > 0) {
        const chatroom = new ChatRoom(chatRoomName, roomType, chatMembers, this.rln, this.connection, this.provider)
        this.chatRoomStore.set(chatRoomName, chatroom)
        return chatroom
      } else {
        console.log("You must register as a user before creating a chat room.")
      }
    }

    /* fetch all chat room messages for a given chatroom */
    public async fetchChatRoomMsgs(contentTopic: string) {
      return await this.chatRoomStore.get(contentTopic)?.retrieveMessageStore(contentTopic)
    }

    public fetchChatRoomsNames() {
      return Array.from(this.chatRoomStore.keys())
    }
  }
