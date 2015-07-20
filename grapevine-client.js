var children = {};
var parents = {};
var serverPublicKey = '138g9u2oy4ghlk';

function connectToChild(childPeerId){
  children[childPeer.id] = Peer.connect(childPeerId);
}

p.on('server-connect', function(peerIds){
  // first connection to grapevine server
  peerIds.forEach(connectToChild);
});

p.on('parent-connect', parentPeer){
  parents[parentPeer.id] = parentPeer;
}

p.on('message', function(message){
  var verified = verifyMessage(message)
  if(verified){
    sendToChildren(message);
    actOnMessage(message); // make sure server sent it  
  }
});

p.on('close', function(peerId){
  if(children[peerId]){
    delete children[peerId];
  } else if(parents [peerId]){
    delete parents[peerId];
  } else {
    console.log('error peerId',peerId,'not a peer');
  }
}

function actOnMessage(message){
  updateUiTotal(message.total);
}
