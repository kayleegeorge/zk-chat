import { WakuLight } from "js-waku/lib/interfaces"
import { Web3Provider } from '@ethersproject/providers'
import { ChatRoom } from "./ChatRoom"
import { RoomType } from "../types/ChatRoomOptions"
import * as rln from "@waku/rln"
import { checkChain, GOERLI } from "../utils/checkChain"
import { MembershipKey } from "@waku/rln"
import { Contract, ethers } from "ethers"
import { arrayify, stringify } from "../utils/formatting"
import { RLN_ABI, RLN_ADDRESS } from "../rln/contractInfo"
import { ZkIdentity } from "@zk-kit/identity"
import RLNRegistry from "rlnjs/lib/registry/RLNRegistry"

/* types for reference:
* -----
* idCommitment: 'pubkey'
* idKey: 'secretKey'
* membershipKey: (idKey, idCommitment)
* membershipId = membershipKeyIndex: index of MembershipKey.idCommitment in rlnContract
* -----
* rlnContract(membershipKey.idCommitment) --> emits (membershipKey.idCommitment, membershipKeyIndex)
*/

export class ChatApp {
    protected appName: string
    protected chatRoomStore: Record<string, ChatRoom>
    protected waku: WakuLight
    protected rlnContract: Contract
    protected rlnRegistry: RLNRegistry
    protected provider: Web3Provider

    public constructor(
        appName: string,
        waku: WakuLight,
        provider: Web3Provider,
        rlnRegistry: RLNRegistry
      ) {
        this.appName = appName
        this.provider = provider
        this.rlnRegistry = rlnRegistry
        this.waku = waku 
    
        this.chatRoomStore = {}
        
      }

      //TODO: ask tyler -- do we need whole zkidentity() or just existing id commiemnt
    /* RLN-level existing memkey generation */
    public registerExistingUser(existingIDKey: string, existingIDCommitment: string) {
      // const memberKeys = new MembershipKey(arrayify(existingIDKey), arrayify(existingIDCommitment))
      this.rlnRegistry.addMember(existingIDCommitment)
    }

    /* RLN-level new user memkey generation */
    public registerNewUser() {
      const identity = new ZkIdentity()
      const identityCommitment = identity.genIdentityCommitment()
      this.rlnRegistry.addMember(identityCommitment)
      return identity
    }



    /* app-level user registration: add user to chatApp */
    public async userRegistration(existingIDKey?: string, existingIDCommitment?: string) {
      /* RLN credentials */
      const userMemkey = (existingIDCommitment && existingIDKey) ? this.registerExistingUser(existingIDKey, existingIDCommitment) : this.registerNewUser()
      const userMemkeyIndex = await this.registerUserOnRLNContract(userMemkey)      
      return this.generateRLNcredentials(userMemkey, userMemkeyIndex) // to-do: get from RLN class
    }

    /* Allow new user registraction with rln contract for rln registry */
    public async registerUserOnRLNContract(memkey: MembershipKey): Promise<number> {
      const price = await this.rlnContract.MEMBERSHIP_DEPOSIT()
      const signer = this.provider.getSigner()

      const rlnContractWithSigner = this.rlnContract.connect(signer)
      const txResponse = await rlnContractWithSigner.register(memkey, {value: price})
      console.log("Transaction broadcasted: ", txResponse)

      const txReceipt = await txResponse.wait()
      console.log("Transaction receipt", txReceipt)

      // return membershipID / membershipkeyIndex
      return txReceipt.events[0].args.index.toNumber()
    }

    /* construct RLN member tree locally */
    public async constructRLNMemberTree() {
      const memRegEvent = this.rlnContract.filters.MemberRegistered()

      // populate merkle tree with existing users
      const registeredMembers = await this.rlnContract.queryFilter(memRegEvent)
      registeredMembers.forEach(event => {
          if (event.args) this.registerExistingUser(event.args.memkey, event.args.memkeyIndex)
      })

      // listen to new members added to rln contract
      this.rlnContract.on(memRegEvent, (event) => {
        this.registerExistingUser(event.args.memkey, event.args.memkeyIndex)
      })
    }

    /* create chat room */
    public createChatRoom(name: string, roomType: RoomType, userMemkey: rln.MembershipKey, userMemkeyIndex: number, chatMembers: string[]) {
      const contentTopic = `/${this.appName}/0.0.1/${roomType}-${name}/proto/`
      if (contentTopic in this.chatRoomStore) {
        return 'Error: Please choose different chat name.'
      }
      if (chatMembers) {
        const chatroom = new ChatRoom(contentTopic, roomType, this.provider, userMemkey, userMemkeyIndex, chatMembers, this.rlnRegistry)
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
