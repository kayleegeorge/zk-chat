
export default class User {
  public address: string | undefined

  public alias: string | undefined

  public identityCommitment: bigint

  public constructor(identityCommitment: bigint, alias?: string, address?: string) {
    this.identityCommitment = identityCommitment
    this.address = address
    this.alias = alias
  } 
  // TODO: subscribe to function
    
} 