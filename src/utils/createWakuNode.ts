import { Protocols } from 'js-waku'
import { createLightNode } from 'js-waku/lib/create_waku'
import { WakuLight } from 'js-waku/lib/interfaces'
import { waitForRemotePeer } from 'js-waku/lib/wait_for_remote_peer'

/* initializes waku instance */
export async function createWakuNode(): Promise<WakuLight | undefined> {
  try {
    const waku = await createLightNode({ defaultBootstrap: true })
    await waku.start()
    await waitForRemotePeer(waku,
      [Protocols.Store, Protocols.Filter, Protocols.LightPush])
    console.log('success creating waku node!')
    return waku
  } catch (e) {
    console.error('Issue creating waku', e)
    return
  }
}