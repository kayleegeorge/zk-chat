/* This is a test */
import { ChatApp } from '../src/lib/ChatApp'
import { createWaku } from '../src/utils/createWaku'

describe("waku", () => {
  it('should generate waku', async () => {
    const waku = await createWaku()
    const zkchat = new ChatApp('zkChat', 0, waku)  
    expect(typeof waku).toBe("object")
    
    // do this
    it('send msg', function() {
      zkchat.sendMessage('first msg test', waku, new Date(), `/zkchat/0.0.1/dm-chat-test/proto/`)
    }) 
      
  })

})
