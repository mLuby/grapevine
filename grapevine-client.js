// TODO reconnect to server on orphan

var children = {};
var parents = {};
var serverPublicKey = '138g9u2oy4ghlk';

something.on('connection-from-server', function(peerIds){
  // first connection to grapevine server
  peerIds.forEach(connectToChild);
});
function connectToChild(childPeerId){
  var childPeer = Peer.connect(childPeerId);
  children[childPeer.id] = childPeer;
}

something.on('message-from-server', handleMessage);
something.on('message-from-peer', handleMessage);
function handleMessage(message){
  var verified = verifyMessage(message)
  if(verified){
    // pass message on to children;
    children.forEach(function(childPeer){
      childPeer.send(message);
    });
    // updateUiTotal(message);
    console.log('UPDATE UI', message);
  }
}

something.on('connection-from-peer', parentPeer){
  // Incoming connections are ALWAYS from parents.
  parents[parentPeer.id] = parentPeer;
}

something.on('peer-disconnect', function(peerId){ // or close
  if(children[peerId]){
    console.log('child',peerId,'disconnected');
    delete children[peerId];
  } else if(parents[peerId]){
    console.log('parent',peerId,'disconnected');
    delete parents[peerId];
  } else {
    console.error('Peer id',peerId,'disconnected but was not a peer.');
  }
}

