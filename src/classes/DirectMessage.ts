import { Waku } from "js-waku/lib/interfaces"
import { zkChat } from "./zkChat"
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { DecoderV0 } from "js-waku/lib/waku_message/version_0";
import { proto } from "../types/ChatMessage";


/*
The purpose of this class is to allow two parties to create a DM
*/
export class DirectMessage extends zkChat {
    public sender: string
    public recipient: string

    protected constructor(
        appName: string,
        provider: Web3Provider,
        chainId: number,
        providerName: string,
        waku? : Waku
    ) {
        super(appName, chainId, [{
            name: 'DM',
            decodeFunction: (msg) => proto.ChatMessage.decode(msg),
        }], waku), provider
        // this.sender = sender
        // this.recipient = recipient
    }

    public static async create(
        appName: string,
        provider: Web3Provider,
        waku?: Waku
    ) {
        const network = await provider.getNetwork()
        const providerName = (await provider.getNetwork()).name
        const directMessage = new DirectMessage(
            appName,
            provider,
            network.chainId,
            providerName,
            waku
        )
        return directMessage
    }

    public async parseRecipient() {
        // the goal of this function is to parse into different 
        // type of recipient (address, ENS, or if don't have one --> id)
    }
}