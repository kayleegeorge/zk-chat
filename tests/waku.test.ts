/* This is a test */
import { ChatApp } from '../src/lib/ChatApp'
import { describe, expect, test } from '@jest/globals'
import { createWaku } from '../src/utils/createWaku'

const waku = await createWaku()
const zkchat = new ChatApp('zkChat', 0, waku)
describe('waku messaging', () => {
    test('init waku', () => {
        expect(waku).toBe(expect.anything())
    })
    if (!waku) return
    test('test msg send', () => {
        zkchat.sendMessage('first msg test', waku, new Date(), `/zkchat/0.0.1/dm-chat/proto/`)
    })

})