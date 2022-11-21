import { Waku } from "js-waku/lib/interfaces"
import { ChatApp, RegistrationType } from "./ChatApp"
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { DecoderV0 } from "js-waku/lib/waku_message/version_0";

type Member = {
    membershipId: string,
    registrationLevel: RegistrationType // 'ENS' 'anon' 'address'
}
/*
 * create a chat room with given members
 */
export class ChatRoom {
    public chatMembers: Member[]
    public contentTopic: string

    protected constructor(
        contentTopic: string,
    ) {
        this.contentTopic = contentTopic
    }

    public static async create(
        appName: string,
        provider: Web3Provider,
        waku?: Waku
    ) {
        const network = await provider.getNetwork()
        const providerName = (await provider.getNetwork()).name
    }

    public async handleMembership () {
        // the goal of this function is to parse into different 
        // type of recipient (address, ENS, or if don't have one --> id)
    }
}