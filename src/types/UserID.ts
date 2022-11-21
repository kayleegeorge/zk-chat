import { ZkIdentity } from "@zk-kit/identity"
import { RegistrationType } from "../lib/ChatApp"

export type UserID = {
    identity: ZkIdentity
    identityCommitment: bigint
    registrationLevel: RegistrationType // 'ENS' 'anon' 'address'
    address?: string
    ENS?: string
}
