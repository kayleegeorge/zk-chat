import { MembershipKey } from "@waku/rln"

export type UserID = {
    memberKeys: MembershipKey
    address?: string
    nickname?: string
}
