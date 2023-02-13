import { ChatApp } from '../src'
import { createWakuNode } from '../src/utils/createWakuNode'

describe('waku node', async () => {
  it('creates waku note without error', async function () {
    await createWakuNode()
  })
})

describe('chatApp', () => {
  const app = new ChatApp('test-app', false)
  const rlnIdentifier = app.rln.rlnIdentifier
  //const rlnMem = app.rln.rlnjs.identity
  it('Expect rln identifier to be big int', async () => {
    expect(rlnIdentifier).toBe(BigInt)
  })
})