import { ethers } from "ethers"
import { Web3Provider } from "@ethersproject/providers/src.ts/web3-provider";
import { checkChain } from "./checkChain";

declare let window: any

/* get ethereum provider */
export default async function getProvider(): Promise<Web3Provider | undefined> {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        return provider
    } catch (e) {
        console.error("No web3 provider available", e);
    }
}

/* get ethereum pubkey address */
export async function getAddress(provider: Web3Provider): Promise<string | undefined> {
    try {
        await provider.send("eth_requestAccounts", [])
        const accounts = await provider.send("eth_requestAccounts", [])
        const address = accounts[0]
        // const accounts = await provider.send("eth_requestAccounts", [])
        const network = await this.provider.getNetwork()
        checkChain(network)
        console.log("Ethereum addressdetected! Account: ", address)
        return address
    } catch (e) {
        console.log("Error retrieving address", e)
    }    
}