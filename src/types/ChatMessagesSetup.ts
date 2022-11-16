import { Message } from "js-waku/lib/interfaces";

export type MessagesSetup<T> = {
  name: string
  decodeFunction: (ChatMessage: Message) => T | undefined
  filterFunction?: (e: T) => boolean
}