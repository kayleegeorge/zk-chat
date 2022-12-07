import { createLightNode } from "js-waku/lib/create_waku";
import { waitForRemotePeer } from "js-waku/lib/wait_for_remote_peer"

/* initializes waku instance */
export async function createWakuNode() {
    try { 
      const waku = await createLightNode({ defaultBootstrap: true })
      await waku.start()
      await waitForRemotePeer(waku)
      return waku;
    } catch (e) {
      console.log("Issue creating waku", e)
    }
  }