import { createLightNode } from "js-waku/lib/create_waku";
import { PeerDiscoveryStaticPeers } from "js-waku/lib/peer_discovery_static_list";
import {
  Fleet,
    getPredefinedBootstrapNodes,
  } from "js-waku/lib/predefined_bootstrap_nodes";
import { waitForRemotePeer } from "js-waku/lib/wait_for_remote_peer";

// initializes waku instance
export async function createWaku() {
    try {
      const waku = await createLightNode({
        libp2p: {
          peerDiscovery: [
            new PeerDiscoveryStaticPeers(
              getPredefinedBootstrapNodes(selectFleetEnv()) // TODO: add aws node here
            ),
          ],
        },
      });
      await waku.start()
      await waitForRemotePeer(waku)
      return waku;
    } catch (e) {
      console.log("Issue creating waku ", e)
    }
  }
  
  function selectFleetEnv() {
    // Works with react-scripts
    if (process?.env?.NODE_ENV === "development") {
      return Fleet.Test;
    } else {
      return Fleet.Prod;
    }
  }