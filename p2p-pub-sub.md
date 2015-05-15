GOAL: distributed pub-sub 


EVENTS:
1. D sends page v1 request to server.
2. server responds to D with page v1 and tells D about peers {1.0: [A, B, C]} and records that latest page version is v1.

3. E sends page  request to server
4. server responds to E with page v1.1 and tells E about peers {1.0: [A, B, C]} and records that latest page version is v1.1.

5. E notes that its page version 1.1 > than peers 1.0, so it tells each peer to update.

6. Av1.0 receives update from Ev1.1


ISSUES:
- A peer may become isolated if all the peers it was connected to disconnect
A:[BCD] -> A:[]
Each peer knows which peers haven't disconnected. If its pool of peers drops below a certain threshold, it can request additional peers from its peers.
A:[B,C,D], C:[A,E,F]
A:[C]
A asks C for peers (don't know if non-server-mediated p2p connections are possible))
A:[C,E,F]

- The minimum number of peers must be tunable to account for how quickly peers drop off.
If A:[B,C,D,E] and [B,C,D,E] all drop simultaneously/before A is able to request additional peers,
then A will be stranded. At that point it could ask the server to be rescued with a list of fresh peers.

- Can a peer fall behind by multiple versions?
Av3:[B], Bv2:[A,C], Cv1:[B]
Doesn't matter, as the latest version will propagate through.

- Security:
Each client can check validity of an update if it's signed by the server, so updates cannot be falsified.
A distinction between shared data and local data becomes critical;
a credit card is private (updates not shared) but a total pledges is public (updates shared).


RESOURCES:
- http://peerjs.com
- https://www.webrtc-experiment.com/docs/WebRTC-PeerConnection.html
- https://github.com/charlieschwabacher/ultrawave
- https://github.com/Temasys/AdapterJS
- https://medium.com/@icecomm/how-to-create-your-own-video-chat-app-in-under-10-mins-aefc6d2b0dff
- http://icecomm.io/


IMPLEMENTATION:

let peers = {
  peer-id: LivePeerConnection
}

onPeerDisconnect (peer) => ::?
  peers.remove(peer)
  while peers.length < minPeers
    if peers.length === 0 
      peers.push(requestPeers(server))
    else
      peers.push(requestPeers(peers)) // iterate through peers till while breaks.

onUpdate (update) => ::?
  if verifyUpdate(update)
    applyUpdate(update)

sendUpdate: ::?
  peers.forEach(sendUpdateToPeer)

requestPeers (target) => ::a->[a]
  peers[target].send('moar peers plz')
  peers[target].on('herer moar peers 4u',
    return moarPeers // might have to push if async, but better/more functional to return.
  )

verifyUpdate (update) => ::a->Bool

applyUpdate (update) => ::side effect
