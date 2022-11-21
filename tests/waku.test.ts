/* This is a test */
import { ChatApp, RegistrationType } from '../src/lib/ChatApp'
import { createWaku } from '../src/utils/createWaku'

describe("waku", () => {
  it('should generate waku', async () => {
    const waku = await createWaku()
    const zkChat = new ChatApp('zkChat', waku)  
    expect(typeof waku).toBe("object")
    
    it('register user', async () => {
      const user = await zkChat.userRegistration(RegistrationType.anon)
      console.log(`Registered user: ${user.identity}`)

      it('send msg', function() {
        zkChat.sendMessage(user, 'first msg test', waku, new Date(), `/zkchat/0.0.1/dm-chat-test/proto/`)
      }) 
    })
    
      
  })

})
