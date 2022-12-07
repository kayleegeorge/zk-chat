/* This is a test */
import { ChatApp } from '../src/lib/ChatApp'
import { createWakuNode } from '../src/utils/createWakuNode'

describe("waku", () => {
  it('should generate waku', async () => {
    const waku = await createWakuNode()
    const zkChat = new ChatApp('zkChat', waku)  
    expect(typeof waku).toBe("object")
    
    it('register user', async () => {
      const rlnCreds = await zkChat.userRegistration()
      console.log(`Registered user: ${rlnCreds.credentials[0].commitment}`)

      // it('send msg', function() {
      //   zkChat.sendMessage(user, 'first msg test', waku, new Date(), `/zkchat/0.0.1/dm-chat-test/proto/`)
      // }) 
    })
    
      
  })

})
