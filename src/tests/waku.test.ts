/* This is a test */
import assert from 'assert'
import { ChatApp } from '../lib/ChatApp'
import { RLN } from '../lib/RLN'
import { RoomType } from '../types/ChatRoomOptions'
import connectWallet from '../utils/connectWallet'

describe("waku", () => {
  it('should generate waku', async () => {
    const provider = await connectWallet()
    assert(provider !== undefined)
    const rln = new RLN(provider)
    console.log(`Rln created: ${rln.identifier}`)

    const zkChat = new ChatApp('zkChat', provider, rln)  
    
    it('register user', async () => {
      const rlnMem = await zkChat.registerUser()
      console.log(`Registered user: ${rlnMem.getIdentityAsString()}`)

      const chatroom = zkChat.createChatRoom('test-room', RoomType.PubGroup, rlnMem, [])
      assert(chatroom !== undefined)
      // should we add rlnMem.alias as a property or nah
      chatroom.sendMessage('first message test', rlnMem.getIdentityAsString())
    })
      
  })

})
