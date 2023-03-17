import { Web3Provider } from '@ethersproject/providers'
import ChatRoom from './ChatRoom'
import { RoomType } from './types/ChatRoomOptions'
import { Connection } from './Connection'
import generateAppIdentifier from './utils/generateAppId'
import { Contract } from 'ethers'
import User from './User'
import RLN from './RLN'

export default class ChatApp {
  public appName: string

  public chatRoomStore: Map<string, ChatRoom>

  public rln: RLN

  public provider: Web3Provider | undefined

  public connection: Connection

  public onChain: Contract | undefined

  public constructor(
    appName: string,
    onChain?: Contract,
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
  public async registerUserOnChain() {
    if (this.provider) await this.rln.registerUserOnRLNContract(this.provider)
    return this.rln.rlnjs.identity
  }

  /* create chat room */
  public createChatRoom(name: string, roomType: RoomType, chatMembers: User[] = []): ChatRoom {
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

  /* get chat room names */
  public fetchChatRoomsNames() {
    return Array.from(this.chatRoomStore.keys())
  }
}
