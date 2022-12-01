import { WakuLight } from "js-waku/lib/interfaces"
import { Web3Provider } from '@ethersproject/providers'
import { createWakuNode } from "../utils/createWaku"
import { ChatRoom } from "./ChatRoom"
import detectEthereumProvider from '@metamask/detect-provider'
import { UserID } from "../types/UserID"
import { RoomType } from "../types/ChatRoomOptions"
import * as rln from "@waku/rln"
import { checkChain, GOERLI } from "../utils/checkChain"
import { MembershipKey } from "@waku/rln"
import { Contract, ethers } from "ethers"
import { arrayify, stringify } from "../utils/formatting"

/* RLN contract constants */
const RLN_ABI = ''
const RLN_ADDRESS = ''

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
    protected waku: WakuLight | undefined
    protected provider: Web3Provider | undefined
    protected chatRoomStore: Record<string, ChatRoom>
    protected rlnInstance: rln.RLNInstance
    protected rlnContract: Contract

    public constructor(
        appName: string,
        waku?: WakuLight,
        provider?: Web3Provider,
      ) {
        this.appName = appName
        this.waku = waku
        this.provider = provider
        
        this.chatRoomStore = {}
        this.rlnContract = new ethers.Contract(RLN_ADDRESS, RLN_ABI, this.provider)
        this.init()
      }

      /* init rln and waku node instances */
      public async init() {
        this.waku = await createWakuNode()
        this.rlnInstance = await rln.create()
        this.provider = await detectEthereumProvider()
      }

    /* RLN-level existing memkey generation */
    public registerExistingUser(existingIDKey: string, existingIDCommitment: string) {
      const memberKeys = new MembershipKey(arrayify(existingIDKey), arrayify(existingIDCommitment))
      this.rlnInstance.insertMember(memberKeys.IDCommitment)
      return memberKeys
    }

    /* RLN-level new user memkey generation */
    public registerNewUser() {
      const memberKeys = this.rlnInstance.generateMembershipKey() // IDKey, IDcommitment
      this.rlnInstance.insertMember(memberKeys.IDCommitment)
      return memberKeys
    }

    /* app-level user registration: add user to chatApp */
    public async userRegistration(existingIDKey?: string, existingIDCommitment?: string, nickname?: string): Promise<UserID> {
      /* RLN credentials */
      const memKey = (existingIDCommitment && existingIDKey) ? this.registerExistingUser(existingIDKey, existingIDCommitment) : this.registerNewUser()
      const memKeyIndex = await this.registerUserOnRLNContract(memKey)
      const RLNcredentials = { 
        "application": this.appName, 
        "appIdentifier": this.rlnInstance.toString(), // figure out string version
        "credentials": [{
          "key": stringify(memKey.IDKey),
          "commitment": stringify(memKey.IDCommitment),
          "membershipGroups": [{
            "chainId": GOERLI, // chainge to optimism when time
            "contract": this.rlnContract.address,
            "treeIndex": memKeyIndex.toString()
          }]
        }],
        "version": 1 // change
      }

      /* user info */
      const newUserID: UserID = { RLNcredentials: RLNcredentials, nickname }
      if (this.provider) {
        await this.provider.send("eth_requestAccounts", [])
        const signer = this.provider.getSigner()
        newUserID.address = await signer.getAddress()
        const network = await this.provider.getNetwork()
        checkChain(network)
        console.log("Ethereum detected! Account: ", newUserID.address)
      } else {
        console.log("Please install Ethereum provider to register with pubkey address.")
      }    
      return newUserID
      /* TODO: add RLN/user credentials to IPFS */
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
          this.registerExistingUser(event.args.memkey, event.args.memkeyIndex)
      })

      // listen to new members added to rln contract
      this.rlnContract.on(memRegEvent, (event) => {
        this.registerExistingUser(event.args.memkey, event.args.memkeyIndex)
      })
    }

    /* create chat room */
    public createChatRoom(name: string, roomType: RoomType) {
      const contentTopic = `/${this.appName}/0.0.1/${roomType}-${name}/proto/`
      if (contentTopic in this.chatRoomStore) {
        return 'Error: Please choose different chat name.'
      }
      const chatroom = new ChatRoom(contentTopic, roomType, this.waku, this.rlnContract, this.provider)
      this.chatRoomStore[contentTopic] = chatroom
      return chatroom
    }

    /* fetch all chat room messages for a given chatroom */
    public async fetchChatRoomMsgs(name: string) {
      return this.chatRoomStore[name].getAllMessages()
    }
  }
