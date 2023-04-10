import { GOERLI } from './utils/checkChain'
import { Registry, RLN as RLNjs, RLNFullProof, Cache } from 'rlnjs'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import generateAppIdentifier from './utils/generateAppId'
// import * as path from 'path'
// import * as fs from 'fs'

/* needed file paths */
// const vkeyPath = path.join('src', 'zkeyFiles', 'verification_key.json')
// const vkey = JSON.parse(vkeyPath) // doesn't work
// const wasmFilePath = path.join('./zkeyFiles', 'rln', 'rln.wasm')
// const finalZkeyPath = path.join('./zkeyFiles', 'rln', 'rln_final.zkey')

const zkeyFiles = {
  vkeyPath: 'zkeyFiles/verification_key.json',
  wasmFilePath: 'zkeyFiles/rln.wasm',
  finalZkeyPath: 'zkeyFiles/rln_final.zkey'
}

export default class RLN {
  registry: Registry

  identityCommitments: bigint[]

  contract: Contract | undefined

  rlnIdentifier: bigint

  rlnjs?: RLNjs

  cache?: Cache

  identityCommitment?: bigint

  vKey?: any
  // private memIndex: number

  constructor(appName: string, onChain?: Contract, rlnIdentifier?: bigint) {
    // create RLN
    this.registry = new Registry()
    this.contract = onChain
    this.identityCommitments = []
    this.rlnIdentifier = rlnIdentifier ? rlnIdentifier : generateAppIdentifier(appName)
  }

  /* call initRLN to create rln instance */
  public async initRLN(existingIdentity?: string) {
    this.vKey = await fetch(zkeyFiles.vkeyPath).then((res) => res.json())
    this.rlnjs = new RLNjs(zkeyFiles.wasmFilePath, zkeyFiles.finalZkeyPath, this.vKey, this.rlnIdentifier, existingIdentity)
    this.rlnIdentifier = this.rlnjs.rlnIdentifier
    this.cache = new Cache(this.rlnjs.rlnIdentifier)
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
    if (!this.rlnjs || !this.identityCommitment) throw "rln not initialized"
    const epochNullifier = RLNjs._genNullifier(epoch, this.rlnIdentifier)
    const merkleProof = this.registry.generateMerkleProof(this.identityCommitment)
    const proof = this.rlnjs.generateProof(msg, merkleProof, epochNullifier)
    return proof
  }

  /* RLN proof verification */
  public async verifyProof(rlnProof: RLNFullProof) {
    return RLNjs.verifySNARKProof(this.vKey, rlnProof.snarkProof)
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
    if (!this.cache) throw "cache not initialized"
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
    if (!this.rlnjs) throw "rln not initialized"
    return this.rlnjs.identity.toString()
  }

  /* generate RLN credentials */
  public generateRLNcredentials(appName: string) {
    if (!this.rlnjs) throw "rln not initialized"
    return {
      'application': appName,
      'appIdentifier': this.rlnjs.rlnIdentifier,
      'credentials': [{
        'key': this.rlnjs.identity.getNullifier(),
        'commitment': this.identityCommitment,
        'membershipGroups': [{
          'chainId': GOERLI, // chainge to optimism when time
          'contract': this.contract,
          // 'treeIndex': this.registry.indexOf(this.identityCommitment),
        }],
      }],
      'version': 1, // change
    }
  }
}
