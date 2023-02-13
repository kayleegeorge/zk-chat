import { Web3Provider } from '@ethersproject/providers'
import ChatRoom from './ChatRoom'
import { RoomType } from './types/ChatRoomOptions'
import RLN from './RLN'
import { Connection } from './Connection'
import generateAppIdentifier from './utils/generateAppId'

export default class ChatApp {
  public appName: string

  public chatRoomStore: Map<string, ChatRoom>

  public rln: RLN

  public provider: Web3Provider | undefined

  public connection: Connection

  public onChain: boolean

  public constructor(
    appName: string,
    onChain: boolean,
    provider?: Web3Provider,
    existingIdentity?: string,
    rlnIdentifier?: bigint,
  ) {
    this.appName = appName 
    this.onChain = onChain

    this.provider = provider
    rlnIdentifier = rlnIdentifier ? rlnIdentifier : generateAppIdentifier(appName)
    this.rln = new RLN(onChain, existingIdentity, rlnIdentifier) // might need to pass provider?
    this.connection = new Connection(this.rln)

    this.chatRoomStore = new Map<string, ChatRoom>()
  }

  /* app-level user registration: add user to chatApp and RLN registry */
  public async registerUser() {
    this.rln.constructRLNMemberTree()
    if (this.provider) await this.rln.registerUserOnRLNContract(this.provider) // TODO: maybe this not needed? investigate
    return this.rln.rlnjs.identity
  }

  /* create chat room */
  public createChatRoom(name: string, roomType: RoomType, chatMembers: string[] = []): ChatRoom {
    let chatRoomName = `/${this.appName}/${roomType}-${name}/`
    // no duplicate chat room names
    let i = 0
    while (chatRoomName + i.toString() in this.chatRoomStore) {
      i += 1
    }
    chatRoomName += i.toString()
    const chatroom = new ChatRoom(chatRoomName, roomType, chatMembers, this.rln, this.connection, this.provider)
    this.chatRoomStore.set(chatRoomName, chatroom)
    return chatroom
  }

  /* fetch all chat room messages for a given chatroom */
  public async fetchChatRoomMsgs(contentTopic: string) {
    return this.chatRoomStore.get(contentTopic)?.retrieveMessageStore()
  }

  public fetchChatRoomsNames() {
    return Array.from(this.chatRoomStore.keys())
  }
}
