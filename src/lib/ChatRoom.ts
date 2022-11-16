import { Waku } from "js-waku/lib/interfaces"
import { zkChat } from "./ChatApp"
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { DecoderV0 } from "js-waku/lib/waku_message/version_0";


/*
The purpose of this class is to allow two parties to create a DM
*/
export class ChatRoom {
    public sender: string
    public recipient: string
    public contentTopic: string

    protected constructor(
        contentTopic: string,
    ) {
        this.contentTopic = contentTopic
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
        // //const directMessage = new ChatMessage(
        //     this.contentTopic,
        // )
        // // return directMessage
    }

    public async parseRecipient() {
        // the goal of this function is to parse into different 
        // type of recipient (address, ENS, or if don't have one --> id)
    }
}