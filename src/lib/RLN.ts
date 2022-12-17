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
        if (existingIdentity) { 
          this.identity = new Identity(existingIdentity)
        } else {
          this.identity = new this.createNew()
        }

        this.rln.registry.addMember(this.identityCommitment)
        this.memIndex = this.rln.registry.indexOf(this.identityCommitment)
    }

    public createNew() {
        this.identity = new Identity()
        this.identityCommitment = this.identity.getCommitment()
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
        "appIdentifier": this.rln.identifier.toString(),
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
}