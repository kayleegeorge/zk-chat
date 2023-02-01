import { ChatApp, ChatRoom } from '../src'
import { RLN } from '../src'
import { ChatMessage } from '../src/types/ChatMessage'

describe("chatApp", () => {
    const app = new ChatApp('test-app')
    const rlnIdentifier = app.rln.rlnIdentifier
    const rlnMem = app.rln.identity
})