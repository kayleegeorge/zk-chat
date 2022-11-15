import { Message } from "js-waku/lib/interfaces";

export type WakuMessagesSetup<T> = {
  name: string
  decodeFunction: (Message: Message) => T | undefined
  filterFunction?: (e: T) => boolean
}