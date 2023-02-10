/* eslint-disable import/export */

import { encodeMessage, decodeMessage, message } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'
import type { Codec } from 'protons-runtime'
import { RLNFullProof } from 'rlnjs'

export interface ChatMessage {
  message: Uint8Array
  epoch: bigint // unix time rounded to the minute
  rlnProof?: RLNFullProof // make non optional once rlnjs updates
  alias?: string
}

export namespace ChatMessage {
  let _codec: Codec<ChatMessage>

  export const codec = (): Codec<ChatMessage> => {
    if (_codec == null) {
      _codec = message<ChatMessage>(
        (obj, writer, opts = {}) => {
          if (opts.lengthDelimited !== false) {
            writer.fork()
          }

          if (obj.message != null) {
            writer.uint32(10)
            writer.bytes(obj.message)
          } else {
            throw new Error(
              'Protocol error: required field "message" was not found in object',
            )
          }

          if (obj.epoch != null) {
            writer.uint32(18)
            writer.uint64(obj.epoch)
          } else {
            throw new Error(
              'Protocol error: required field "epoch" was not found in object',
            )
          }

    // TODO: which type of message is the Waku sending
    static decodeMessage(wakuMsg: any): ChatMessage | undefined {
      if (wakuMsg.payload) {
        try {
          return ChatMessage.decode(wakuMsg.payload)
        } catch (e) {
          console.error("Failed to decode chat message", e)
        }
      }
    }
    return
  }

          const end = length == null ? reader.len : reader.pos + length

          while (reader.pos < end) {
            const tag = reader.uint32()

            switch (tag >>> 3) {
              case 1:
                obj.message = reader.string()
                break
              case 2:
                obj.epoch = reader.uint64()
                break
              case 3:
                obj.rln_proof = reader.bytes()
                /*
                  obj.rateLimitProof = RateLimitProof.codec().decode(
                  reader,
                  reader.uint32()
                );
                */
                break
              case 4:
                obj.alias = reader.string()
                break
              default:
                reader.skipType(tag & 7)
                break
            }
          }

          if (obj.epoch == null) {
            throw new Error(
              'Protocol error: value for required field "epoch" was not found in protobuf',
            )
          }

          if (obj.rln_proof == null) {
            // throw new Error(
            //   'Protocol error: value for required field "rln_proof" was not found in protobuf'
            // );
            console.log('no rln proof attached')
          }

          if (obj.message == null) {
            throw new Error(
              'Protocol error: value for required field "message" was not found in protobuf',
            )
          }

          return obj
        },
      )
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