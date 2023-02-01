import { GOERLI } from "../utils/checkChain";
import { genExternalNullifier, Registry, RLN as RLNjs, RLNFullProof, Cache} from "rlnjs" 
import { Contract, ethers } from "ethers";
import { RLN_ABI, RLN_ADDRESS } from "../rln/contractInfo";
import { Web3Provider } from "@ethersproject/providers";
import * as path from 'path'
import { Identity } from '@semaphore-protocol/identity';
import * as fs from 'fs'

/* needed file paths */
const vkeyPath = path.join("./zkeyFiles", "rln", "verification_key.json")
const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
const wasmFilePath = path.join("./zkeyFiles", "rln", "rln.wasm")
const finalZkeyPath = path.join("./zkeyFiles", "rln", "rln_final.zkey")

export class RLN {
    public registry: Registry
    public identityCommitments: bigint[]
    public contract: Contract
    public rlnInstance: RLNjs
    public cache: Cache
    public identity: Identity
    public rlnIdentifier: bigint
    private identityCommitment: bigint
    private memIndex: number

    constructor(existingIdentity?: string, rlnIdentifier?: bigint, provider?: ethers.providers.Provider) {
        // RLN
        this.contract = new ethers.Contract(RLN_ADDRESS, RLN_ABI) // might need to add back provider
        this.registry = new Registry()
        this.rlnInstance = new RLNjs(wasmFilePath, finalZkeyPath, vkey, rlnIdentifier, existingIdentity)
        this.identity = this.rlnInstance.identity
        this.rlnIdentifier = this.rlnInstance.rlnIdentifier
        this.identityCommitments = []
        this.cache = new Cache(this.rlnInstance.rlnIdentifier)

        // RLN member
        this.identityCommitment = this.identity.getCommitment() 
        this.registry.addMember(this.identityCommitment)
        this.memIndex = this.registry.indexOf(this.identityCommitment)
    }

    public async verifyProof(rlnProof: RLNFullProof) {
      return await RLNjs.verifyProof(vkey, rlnProof)
    }

    public getIdentityAsString() {
      return this.identity.toString()
    }

    // generateProof 
    public async generateRLNProof(msg: string, epoch: bigint) {
      const epochNullifier = genExternalNullifier(epoch.toString())
      const merkleProof = await this.registry.generateMerkleProof(this.identityCommitment)
      const proof = this.rlnInstance.genProof(msg, merkleProof, epochNullifier)
      return proof
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

    /* Allow new user registraction with rln contract for rln registry */
    public async registerUserOnRLNContract(provider: Web3Provider) {
      const price = await this.contract.MEMBERSHIP_DEPOSIT()
      const signer = provider.getSigner()

      const rlnContractWithSigner = this.contract.connect(signer)
      const txResponse = await rlnContractWithSigner.register(this.identityCommitment, {value: price})
      console.log("Transaction broadcasted: ", txResponse)

      const txReceipt = await txResponse.wait()
      console.log("Transaction receipt", txReceipt)

      this.memIndex = txReceipt.events[0].args.index.toNumber()
    }

    /* handle adding proof to cache */
    public addProofToCache(proof: RLNFullProof) {
      const result = this.cache.addProof(proof)
      
      // if breached, slash the member id commitment
      if ("breach") {
        this.registry.slashMember(result.secret) 
        const withdrawRes = this.contract.withdraw(result.secret) // might need to add payable receiver
        console.log("member withdrawn: ", withdrawRes)
      }
    }

    /* generate RLN credentials */
    public generateRLNcredentials(appName: string) {
      return { 
        "application": appName, 
        "appIdentifier": this.rlnInstance.rlnIdentifier,
        "credentials": [{
          "key": this.identity.getNullifier(),
          "commitment": this.identityCommitment,
          "membershipGroups": [{
            "chainId": GOERLI, // chainge to optimism when time
            "contract": this.contract,
            "treeIndex": this.registry.indexOf(this.identityCommitment)
          }]
        }],
        "version": 1 // change
      }
    }
} 
