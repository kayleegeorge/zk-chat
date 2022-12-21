import { GOERLI } from "../utils/checkChain";
import { generateMerkleProof, genExternalNullifier, Registry, RLN as RLNjs, RLNFullProof } from "rlnjs/src" 
import { Contract, ethers } from "ethers";
import { RLN_ABI, RLN_ADDRESS } from "../rln/contractInfo";
import { Web3Provider } from "@ethersproject/providers";
import { Identity } from "@semaphore-protocol/identity"
import * as path from 'path'
import * as fs from 'fs'

/* zkey file path */
const vkeyPath = path.join("./zkeyFiles", "rln", "verification_key.json")
const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
const wasmFilePath = path.join("./zkeyFiles", "rln", "rln.wasm")
const finalZkeyPath = path.join("./zkeyFiles", "rln", "rln_final.zkey")

export class RLN {
    public registry: Registry
    public identityCommitments: bigint[]
    public identifier: bigint
    public contract: Contract

    constructor(provider: Web3Provider) {
        this.identifier = RLNjs.genIdentifier()
        this.contract = new ethers.Contract(RLN_ADDRESS, RLN_ABI, provider)
        this.registry = new Registry(20)
    }

    public async verifyProof(rlnProof: RLNFullProof) {
      return await RLNjs.verifyProof(vKey, rlnProof)
    }

    /* construct RLN member tree locally */
    public async constructRLNMemberTree() {
      const memRegEvent = this.contract.filters.MemberRegistered()

      // populate merkle tree with existing users
      const registeredMembers = await this.contract.queryFilter(memRegEvent)
      registeredMembers.forEach(event => {
          if (event.args) this.registry.addMember(event.args.memkey)
      })

      // listen to new members added to rln contract
      this.contract.on(memRegEvent, (event) => {
        this.registry.addMember(event.args.memkey)
      })
    }
} 

/* 
If existing identity, pass in identity.toString() to constructor
*/

export class RLNMember {
    private identity: Identity
    private identityCommitment: bigint
    private memIndex: number
    public rln: RLN

    constructor (
        rln: RLN,
        existingIdentity?: string, 
    ) {
        this.rln = rln
        this.identity = (existingIdentity) ? new Identity(existingIdentity) : new Identity()
        this.identityCommitment = this.identity.getCommitment() 
        this.rln.registry.addMember(this.identityCommitment)
        this.memIndex = this.rln.registry.indexOf(this.identityCommitment)
    }

    public getIdentityAsString() {
      return this.identity.toString()
    }

    public async generateProof(
        rawMessage: { message: string, epoch: bigint }
      ): Promise<RLNFullProof> {
        const secretHash = this.identity.getNullifier() // confirm this is nullifer vs trapdoor

        const leaves = Object.assign([], this.rln.identityCommitments)
        leaves.push(this.identityCommitment)
    
        const signal = rawMessage.message
        const epoch = genExternalNullifier(rawMessage.epoch.toString()) // need to do something else here?
        
        const merkleProof = await generateMerkleProof(15, BigInt(0), leaves, this.identityCommitment)
        const witness = RLNjs.genWitness(secretHash, merkleProof, epoch, signal, this.rln.identifier)
        const rlnProof = await RLNjs.genProof(witness, wasmFilePath, finalZkeyPath)
        return rlnProof
    }

    public generateRLNcredentials(appName: string) {
      return { 
        "application": appName, 
        "appIdentifier": this.rln.identifier,
        "credentials": [{
          "key": this.identity.getNullifier(),
          "commitment": this.identityCommitment,
          "membershipGroups": [{
            "chainId": GOERLI, // chainge to optimism when time
            "contract": this.rln.contract,
            "treeIndex": this.rln.registry.indexOf(this.identityCommitment)
          }]
        }],
        "version": 1 // change
      }
    }

    /* Allow new user registraction with rln contract for rln registry */
    public async registerUserOnRLNContract(provider: Web3Provider) {
      const price = await this.rln.contract.MEMBERSHIP_DEPOSIT()
      const signer = provider.getSigner()

      const rlnContractWithSigner = this.rln.contract.connect(signer)
      const txResponse = await rlnContractWithSigner.register(this.identityCommitment, {value: price})
      console.log("Transaction broadcasted: ", txResponse)

      const txReceipt = await txResponse.wait()
      console.log("Transaction receipt", txReceipt)

      this.memIndex = txReceipt.events[0].args.index.toNumber()
    }
}