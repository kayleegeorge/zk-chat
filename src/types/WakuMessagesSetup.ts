import { WakuMessage } from "js-waku/dist/proto/message";

export type WakuMessagesSetup<T> = {
  name: string
  decodeFunction: (wakuMessage: WakuMessage) => T | undefined
  filterFunction?: (e: T) => boolean
}