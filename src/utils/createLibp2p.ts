import { tcp } from '@libp2p/tcp'
import { WebSockets } from '@libp2p/websockets'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@chainsafe/libp2p-noise'
import defaultsDeep from '@nodeutils/defaults-deep'
import { createLibp2p as create } from 'libp2p'
import { webRTC } from '@libp2p/webrtc'

export async function createLibp2p(_options) {
  const defaults = {
    transports: [webRTC()],
    streamMuxers: [() => new Mplex()],
    connectionEncryption: [() => new Noise()]
  }

  return create(defaultsDeep(_options, defaults))
}