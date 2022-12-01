import { Network } from "@ethersproject/providers";

export const GOERLI = 5;
export const OPTIMISM = 10;

export async function checkChain(network: Network) {
    if (network.chainId !== GOERLI) {
        alert("Switch to Goerli")
    }
}