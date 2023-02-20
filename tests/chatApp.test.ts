import { ChatApp, ChatRoom } from '../src'
import { RoomType } from '../src/types/ChatRoomOptions'
import { strToArr } from '../src/utils/formatting'
import { ChatMessage } from '../src/types/ChatMessage'
import { createWakuNode } from '../src/utils/createWakuNode'
import { RLN_ABI, RLN_ADDRESS } from '../src/rln/contractInfo'
import { Contract } from 'ethers'
import User from '../src/User'
import generateAppIdentifier from '../src/utils/generateAppId'

describe('test chat message encode / decode', () => {
  const protoMsg = new ChatMessage({
    message: strToArr('test msg'),
    epoch: BigInt(100),
  })
  const encodedMsg = protoMsg.encode()
  expect(encodedMsg).toBe(Uint8Array)

  const decodedMsg = ChatMessage.decode(encodedMsg)
  expect(decodedMsg).toBeInstanceOf(ChatMessage)
  
  expect(decodedMsg.message).toBe('test msg')
  expect(decodedMsg.epoch).toBe(BigInt(100))
})

/* generate app identifier */
describe('generate app id', async () => {
  const appId = generateAppIdentifier('test-app-name')
  const testApp = new ChatApp('test-app-name')
  it('generate app', () => {
    expect(appId).toBeInstanceOf(BigInt)
  })

  it('ensure app name works', () => {
    expect(appId).toEqual(testApp.rln.rlnIdentifier)
  })
})

/* invoke node util */
describe('waku node', async () => {
  it('creates waku note without error', async function () {
    await createWakuNode()
  })
})

/* with contract */
describe('Chat App with contract functionality', () => {
  const contract = new Contract(RLN_ADDRESS, RLN_ABI)
  it('inits contract properly', () => {
    expect(contract).toBeInstanceOf(Contract)
  })

  const app = new ChatApp('test-contract-app', contract)
  
  it('Expect rln identifier to be big int', () => {
    const rlnIdentifier = app.rln.rlnIdentifier
    expect(rlnIdentifier).toBeInstanceOf(BigInt)
  })
  
})

/* without contract */
describe('chatApp without contract', () => {
  const app = new ChatApp('test-app')

  it('Expect rln identifier to be big int', () => {
    const rlnIdentifier = app.rln.rlnIdentifier
    expect(rlnIdentifier).toBeInstanceOf(BigInt)
  })

  it('expect rln member', () => {
    const rlnMember = app.rln.identityCommitment
    expect(rlnMember).toBeInstanceOf(BigInt)
  })


  const chatroom = new ChatRoom('test-chatroom', RoomType.PubGroup, [], app.rln, app.connection)

  it('create chat room', () => {
    expect(chatroom).toBe(ChatRoom)
    const chatMembers = chatroom.getChatMembers()
    expect(chatMembers[0]).toBeInstanceOf(User)
  })

  it('send message', async () => {
    await chatroom.sendMessage('test msg', 'klee')
  })

  it('process message', async () => {
    const msgsSent = await chatroom.retrieveMessageStore()
    expect(msgsSent[0]).toBeInstanceOf(ChatMessage)
  })

})
