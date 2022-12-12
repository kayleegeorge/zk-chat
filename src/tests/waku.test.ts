/* This is a test */
import { ChatApp } from '../lib/ChatApp'
import Setup from '../utils/setup'

describe("waku", () => {
  it('should generate waku', async () => {
    const { waku, provider, rlnInstance } = await Setup()
    console.log(`Setup: rlnInstance = ${rlnInstance}`)
    const zkChat = new ChatApp('zkChat', waku, provider, rlnInstance)  
    
    it('register user', async () => {
      const rlnCreds = await zkChat.userRegistration()
      console.log(`Registered user: ${rlnCreds.credentials[0].commitment}`)

      // const chatroom = zkChat.createChatRoom('test-room', rlnCreds.credentials[0].key, rlnCreds.credentials[0].commitment)
    })
      
  })

})
