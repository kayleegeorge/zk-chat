import { GOERLI } from './utils/checkChain'
import { Registry, RLN as RLNjs, RLNFullProof, Cache } from 'rlnjs'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import * as path from 'path'
// import * as fs from 'fs'

/* needed file paths */
const vkeyPath = path.join('src', 'zkeyFiles', 'verification_key.json')
const vkey = JSON.parse(vkeyPath) // doesn't work
const wasmFilePath = path.join('./zkeyFiles', 'rln', 'rln.wasm')
const finalZkeyPath = path.join('./zkeyFiles', 'rln', 'rln_final.zkey')

export default class RLN {
  registry: Registry

  identityCommitments: bigint[]

  contract: Contract | undefined

  rlnjs: RLNjs

  cache: Cache

  rlnIdentifier: bigint

  identityCommitment: bigint
  // private memIndex: number

  constructor(onChain?: Contract, existingIdentity?: string, rlnIdentifier?: bigint) {
    // RLN
    this.registry = new Registry()
    this.contract = onChain

    this.rlnjs = new RLNjs(wasmFilePath, finalZkeyPath, vkey, rlnIdentifier, existingIdentity)
    this.rlnIdentifier = this.rlnjs.rlnIdentifier
    this.identityCommitments = []
    this.cache = new Cache(this.rlnjs.rlnIdentifier)

    // RLN member
    this.identityCommitment = this.rlnjs.identity.getCommitment()
    this.registry.addMember(this.identityCommitment)
  }

  /* handle init on chain stuff */
  public async initOnChain() {
    if (!this.contract) return
    await this.constructRLNMemberTree()
  }

  /* generate RLN Proof */
  public async generateRLNProof(msg: string, epoch: bigint) {
    const epochNullifier = RLNjs._genNullifier(epoch, this.rlnIdentifier)
    const merkleProof = this.registry.generateMerkleProof(this.identityCommitment)
    const proof = this.rlnjs.generateProof(msg, merkleProof, epochNullifier)
    return proof
  }

  /* RLN proof verification */
  public async verifyProof(rlnProof: RLNFullProof) {
    return RLNjs.verifySNARKProof(vkey, rlnProof.snarkProof)
  }

  /* construct RLN member tree locally */
  public async constructRLNMemberTree() {
    if (!this.contract) return
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
    if (!this.contract) return

    const price = await this.contract.MEMBERSHIP_DEPOSIT()
    const signer = provider.getSigner()

    const rlnContractWithSigner = this.contract.connect(signer)
    const txResponse = await rlnContractWithSigner.register(this.identityCommitment, { value: price })
    console.log('Transaction broadcasted: ', txResponse)

    const txReceipt = await txResponse.wait()
    console.log('Transaction receipt', txReceipt)

    // this.memIndex = txReceipt.events[0].args.index.toNumber()
  }

  /* handle adding proof to cache */
  public addProofToCache(proof: RLNFullProof) {
    const result = this.cache.addProof(proof)

    // if breached, slash the member id commitment
    if (result.secret) {
      this.registry.slashMember(BigInt(result.secret))
      console.log('member withdrawn: ', result.secret)

      // if on chain, slash
      if (this.contract) {
        const withdrawRes = this.contract.withdraw(result.secret) // might need to add payable receiver
        console.log('contract rest: ', withdrawRes)
      }
    }
  }
  
  /* returns rln member Identity */
  public getIdentityAsString() {
    return this.rlnjs.identity.toString()
  }

  /* generate RLN credentials */
  public generateRLNcredentials(appName: string) {
    return {
      'application': appName,
      'appIdentifier': this.rlnjs.rlnIdentifier,
      'credentials': [{
        'key': this.rlnjs.identity.getNullifier(),
        'commitment': this.identityCommitment,
        'membershipGroups': [{
          'chainId': GOERLI, // chainge to optimism when time
          'contract': this.contract,
          'treeIndex': this.registry.indexOf(this.identityCommitment),
        }],
      }],
      'version': 1, // change
    }
  }
}
