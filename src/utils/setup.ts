import { Web3Provider } from "@ethersproject/providers"
import * as rln from "@waku/rln"
import { WakuLight } from "js-waku/lib/interfaces"
import connectWallet from "./connectWallet"
import { createWakuNode } from "./createWakuNode"

interface setup {
    waku: WakuLight
    provider: Web3Provider
    rlnInstance: rln.RLNInstance
}

export default async function Setup(existingWaku?: WakuLight): Promise<setup> {
    try {
        const waku = existingWaku ?? await createWakuNode() 
        const provider = await connectWallet()
        const rlnInstance = await rln.create()
        return { waku, provider, rlnInstance }
    } catch (e) {
        console.error("Setup for waku/wallet/rlnInstance failed", e);
    }
}
