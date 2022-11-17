/* This is a test */
import { ChatApp } from '../src/lib/ChatApp'
import { describe, expect, test } from '@jest/globals'
import { createWaku } from '../src/utils/createWaku'

describe('waku messaging', () => {
    
    test('init waku', () => {
        expect(createWaku()).toBe()
    })

    const zkchat = new ChatApp('zkChat', waku, {}, 0);

})