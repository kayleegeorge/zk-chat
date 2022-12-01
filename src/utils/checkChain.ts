import { Network } from "@ethersproject/providers";

const GOERLI = 5;
const OPTIMISM = 10;

export async function checkChain(network: Network) {
    if (network.chainId !== GOERLI) {
        alert("Switch to Goerli")
    }
}