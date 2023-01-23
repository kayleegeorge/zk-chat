import { Mplex } from '@libp2p/mplex'
// import { noise } from '@chainsafe/libp2p-noise'
import { createLibp2p as create } from 'libp2p'
import { webRTC } from '@libp2p/webrtc'

export async function createLibp2p(_options?: any) {
  const defaults = {
    transports: [webRTC()],
    streamMuxers: [() => new Mplex()],
    // connectionEncryption: [() => noise()]
  }

  return create(_options.concat(defaults))
}