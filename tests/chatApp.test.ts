import { ChatApp } from '../src'
import { createWakuNode } from '../src/utils/createWakuNode'
describe("waku node", async () => {
    const wakuNode = await createWakuNode()
    test("Expect Waku Node to be an object", async () => {
        expect(wakuNode).toBe('object')
    })
})

describe("chatApp", () => {
    const app = new ChatApp('test-app', false)
    const rlnIdentifier = app.rln.rlnIdentifier
    //const rlnMem = app.rln.rlnjs.identity
    test("Expect Waku Node to be an object", async () => {
        expect(rlnIdentifier).toBe(BigInt)
    })
})