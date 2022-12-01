import { MembershipKey } from "@waku/rln"

export type UserID = {
    memKey: MembershipKey
    memKeyIndex?: number
    address?: string
    nickname?: string
}
