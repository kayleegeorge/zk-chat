// import { ChatApp, ChatRoom } from '../dist'
import { ChatMessage } from '../dist/proto/ChatMessage'
// import { RoomType } from '../dist/types/ChatRoomOptions'
import { utf8ToBytes } from '../dist/utils/formatting'
import { ChatMessage as ChatMsg } from '../src/types/ChatMessage'
// import { createWakuNode } from '../src/utils/createWakuNode'

// to do: delete either chatMessage or chatmsg
describe('test protons', () => {
  const chatMsg: ChatMessage = {
    message: utf8ToBytes('test msg'),
    epoch: BigInt(100), 
  }

  const encodedMsg = ChatMessage.encode(chatMsg)
  expect(encodedMsg).toBe(Uint8Array)

  const decodedMsg = ChatMessage.decode(encodedMsg)
  expect(decodedMsg).toBeInstanceOf(ChatMessage)
})

describe('test types', () => {
  const protoMsg = new ChatMsg({
    message: utf8ToBytes('test msg'),
    epoch: BigInt(100),
  })
  const encodedMsg = protoMsg.encode()
  expect(encodedMsg).toBe(Uint8Array)

  const decodedMsg = ChatMsg.decode(encodedMsg)
  expect(decodedMsg).toBeInstanceOf(ChatMsg)
})

// describe('waku node', async () => {
//   it('creates waku note without error', async function () {
//     await createWakuNode()
//   })
// })

// describe('chatApp', () => {
//   const app = new ChatApp('test-app', false)
//   //const rlnMem = app.rln.rlnjs.identity
//   it('Expect rln identifier to be big int', () => {
//     const rlnIdentifier = app.rln.rlnIdentifier
//     expect(rlnIdentifier).toBe(BigInt)
//   })
  
//   it('expect rln member', () => {
//     const rlnMember = app.rln.identityCommitment
//     expect(rlnMember).toBe(BigInt)
//   })

//   const chatroom = new ChatRoom('test-chatroom', RoomType.PubGroup, [], app.rln, app.connection)

//   it('create chat room', () => {
//     expect(chatroom).toBe(ChatRoom)
//     const chatMembers = chatroom.getChatMembers()
//     expect(chatMembers[0]).toBe(String)
//   })

//   it('send message', async () => {
//     await chatroom.sendMessage('test msg', 'klee')
//   })

//   it('process message', async () => {
//     const msgsSent = await chatroom.retrieveMessageStore()
//     expect(msgsSent[0]).toBe(ChatMessage)
//   })
  
// })
