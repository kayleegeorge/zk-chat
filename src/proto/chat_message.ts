/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-namespace */

import { encodeMessage, decodeMessage, message } from "protons-runtime";
import type { Uint8ArrayList } from "uint8arraylist";
import type { Codec } from "protons-runtime";

export interface ChatMessage {
    message: string 
    epoch: bigint // unix time rounded to the minute
    // rln_proof: Uint8Array
    alias?: string
}

export namespace ChatMessage {
  let _codec: Codec<ChatMessage>;

  export const codec = (): Codec<ChatMessage> => {
    if (_codec == null) {
      _codec = message<ChatMessage>(
        (obj, writer, opts = {}) => {
          if (opts.lengthDelimited !== false) {
            writer.fork();
          }

          if (obj.message != null) {
            writer.uint32(10)
            writer.string(obj.message)
          } else {
            throw new Error(
              'Protocol error: required field "message" was not found in object'
            );
          }

          if (obj.epoch != null) {
            writer.uint32(18)
            writer.uint64(obj.epoch)
          } else {
            throw new Error(
              'Protocol error: required field "epoch" was not found in object'
            );
          }

          // if (obj.message != null) {
          //   writer.uint32(26)
          //   writer.bytes(obj.rln_proof)
          // } else {
          //   throw new Error(
          //     'Protocol error: required field "message" was not found in object'
          //   );
          // }
          if (obj.alias != null) {
            writer.uint32(34)
            writer.string(obj.alias)
          }

          if (opts.lengthDelimited !== false) {
            writer.ldelim();
          }
        },
        (reader, length) => {
          const obj: any = {
            message: "",
            epoch: 0,
            // rln_proof: new Uint8Array(0),
            alias: ""
          };

          const end = length == null ? reader.len : reader.pos + length;

          while (reader.pos < end) {
            const tag = reader.uint32();

            switch (tag >>> 3) {
              case 1:
                obj.message = reader.string();
                break;
              case 2:
                obj.epoch = reader.uint64();
                break;
              case 3:
                obj.rln_proof = reader.bytes();
                break;
              case 4:
                obj.alias = reader.string()
                break
              default:
                reader.skipType(tag & 7);
                break;
            }
          }

          if (obj.epoch == null) {
            throw new Error(
              'Protocol error: value for required field "epoch" was not found in protobuf'
            );
          }

          if (obj.rln_proof == null) {
            throw new Error(
              'Protocol error: value for required field "rln_proof" was not found in protobuf'
            );
          }

          if (obj.message == null) {
            throw new Error(
              'Protocol error: value for required field "message" was not found in protobuf'
            );
          }

          return obj;
        }
      );
    }

    return _codec;
  };

  export const encode = (obj: ChatMessage): Uint8Array => {
    return encodeMessage(obj, ChatMessage.codec());
  };

  export const decode = (buf: Uint8Array | Uint8ArrayList): ChatMessage => {
    return decodeMessage(buf, ChatMessage.codec());
  };
}