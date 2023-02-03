import { ChatApp } from '../src'
import { createWakuNode } from '../src/utils/createWakuNode'
describe("waku node", async () => {
    const wakuNode = await createWakuNode()
    assert(wakuNode !== undefined)
})

describe("chatApp", () => {
    const app = new ChatApp('test-app')
    const rlnIdentifier = app.rln.rlnIdentifier
    const rlnMem = app.rln.rlnjs.identity
    console.log(rlnMem)
})