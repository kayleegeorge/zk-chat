import { ethers } from 'ethers'
import { fromString } from 'uint8arrays/from-string'
import { toString } from 'uint8arrays/to-string'

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

export function utf8ToBytes(s: string) {
  return fromString(s, 'utf8')
}

export function bytesToUtf8(b: Uint8Array) {
  return toString(b, 'utf8')
}