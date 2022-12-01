import { ethers } from "ethers"

/* helper function to convert to proper ethers key */
export function arrayify(key: string): Uint8Array {
    return ethers.utils.zeroPad(ethers.utils.arrayify(key), 32)
}
export function stringify(arr: Uint8Array): string {
    return ethers.utils.hexlify(arr)
}