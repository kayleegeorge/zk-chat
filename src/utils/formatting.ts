import { ethers } from 'ethers'

/* helper function to convert to proper ethers key */
export function arrayify(key: string): Uint8Array {
  return ethers.utils.zeroPad(ethers.utils.arrayify(key), 32)
}
export function stringify(arr: Uint8Array): string {
  return ethers.utils.hexlify(arr)
}

export function dateToEpoch(timestamp: Date): bigint {
  const timeInMS = timestamp.getTime()
  return BigInt(Math.floor(timeInMS / 1000))
}

export function strToArr(s: string) {
  return new TextEncoder().encode(s)
}

export function arrToStr(b: Uint8Array) {
  return new TextDecoder().decode(b)
}