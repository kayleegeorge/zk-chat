/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/export */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Codec, encodeMessage, decodeMessage, message } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'


export interface ChatMessage {
  message: Uint8Array
  epoch: bigint
  rlnProof?: Uint8Array
  alias?: string
}

export namespace ChatMessage {
  let _codec: Codec<ChatMessage>

  export const codec = (): Codec<ChatMessage> => {
    if (_codec == null) {
      _codec = message<ChatMessage>((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork()
        }

        if ((obj.message != null && obj.message.byteLength > 0)) {
          w.uint32(10)
          w.bytes(obj.message)
        }

        if ((obj.epoch != null)) {
          w.uint32(16)
          w.uint64(obj.epoch)
        }

        if (obj.rlnProof != null) {
          w.uint32(26)
          w.bytes(obj.rlnProof)
        }

        if (obj.alias != null) {
          w.uint32(34)
          w.string(obj.alias)
        }

        if (opts.lengthDelimited !== false) {
          w.ldelim()
        }
      }, (reader, length) => {
        const obj: any = {
          message: new Uint8Array(0),
          epoch: 0,
        }

        const end = length == null ? reader.len : reader.pos + length

        while (reader.pos < end) {
          const tag = reader.uint32()

          switch (tag >>> 3) {
            case 1:
              obj.message = reader.bytes()
              break
            case 2:
              obj.epoch = reader.uint64()
              break
            case 3:
              obj.rlnProof = reader.bytes()
              break
            case 4:
              obj.alias = reader.string()
              break
            default:
              reader.skipType(tag & 7)
              break
          }
        }

        return obj
      })
    }

    return _codec
  }

  export const encode = (obj: ChatMessage): Uint8Array => {
    return encodeMessage(obj, ChatMessage.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): ChatMessage => {
    return decodeMessage(buf, ChatMessage.codec())
  }
}
