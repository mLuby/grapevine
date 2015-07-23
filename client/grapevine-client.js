'use strict';

var Grapevine = (function() {
  var id = ''
  var children = [];
  var parents = [];
  var messages = [];
  var expectedNumParents = 3;

  function Grapevine(options) {
    id = createUniqueId({ length:19 });
  }

  Grapevine.prototype.connect = function(url) {
    var thisPeer = new Peer(id, options);

    // The server connects
    thisPeer.on('open', function(id){
      // TODO generic GET; not Angular
      $http.get('http://localhost:3000/children').success(function(childrenIds){
        console.log('children', childrenIds);
        childrenIds.forEach(function(childId){
          var peerDataConnection = thisPeer.connect(childId);
          handleOpenConnection(peerDataConnection, {isChild: true});
        });
      });
    })

    thisPeer.on('server-message', processMessage);

    // A peer connects
    thisPeer.on('connection', function(peerDataConnection) {
      handlePeerConnection(peerDataConnection, { isChild:false });
    })

    thisPeer.on('disconnected', function() {
      console.log('this peer disconnected');
    });

    thisPeer.on('close', function() {
      console.log('this peer closed');
    });

    thisPeer.on('error', function(err) {
      console.warn('this peer error',err);
    });
  }

  function handlePeerConnection(peerDataConnection, options){
    // A peer connects
    peerDataConnection.on('open', function() {
      var parentsOrChildren = options.isChild ? children : parents;
      parentsOrChildren.push({ id: peerDataConnection.peer, peerDataConnection:peerDataConnection, status:'connected' });
      // Auto-disconnect when this peer has enough parents.
      if(parents.length >= expectedNumParents){
        thisPeer.disconnect();
      }
    });

    // A peer sends data
    peerDataConnection.on('data', processMessage);

    // A peer closes connection to this peer
    peerDataConnection.on('close', function(){ 
      whenAPeerClosesConnection(peerDataConnection.peer, parents, thisPeer); 
    });

    peerDataConnection.on('error', function(err) {
      console.log(peerDataConnection.peer, peerDataConnection.open, 'peerDataConnection error', err);
    });
  }

  return Grapevine;;
})();

function createUniqueId(options) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for( var i=0; i < options.length || 12; i++ ){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function whenAPeerClosesConnection(peerId, thisPeer, parents, children) {
  findPeerByID(peerId, parents, children).status = 'closed';
  var allParentsAreClosed = parents.reduce(function(areAllClosed, parent){ return areAllClosed && parent.status === 'closed' ? true : false; }, true);
  if(allParentsAreClosed) {
    console.log('I`ve become an orphan. Reconnecting...');
    thisPeer.reconnect();
  }
}

function findPeerByID(id, parents, children){
  var parentsIndex = parents.map(function(peer){ return peer.id; }).indexOf(id);
  var childrenIndex = children.map(function(peer){ return peer.id; }).indexOf(id);
  return ~parentsIndex ? parents[parentsIndex] : children[childrenIndex];
  }
}

function processMessage(message) {
  // TODO interact with user-supplied callback
  if(!alreadyReceived(message) && verifiedFromServer(message)) {
    messages.push(message);
    sendToAllConnections(message);
  }

  function alreadyReceived(message){
    var messageIndex = self.data.messages.map(function(message){ return message.timestamp; }).indexOf(message.timestamp);
    return ~messageIndex ? true: false;
  }
  function verifiedFromServer(message, serverPublicKey){
    // TODO add message verification/decryption
    return true;
  }
}

function sendToAllConnections(message){
  var temp = message.sender; // TODO -_-
  message.sender = id
  children.forEach(function(child){
    sendToConnection(child.id, message);
  });
  message.sender = temp;
}

function sendToConnection(peerId, data){
  findPeerByID(peerId).dataConnection.send(data);
}
