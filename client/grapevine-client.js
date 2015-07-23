'use strict';

var Grapevine = (function () {
  var id = ''
  var children = [];
  var parents = [];
  var messages = [];
  var expectedNumParents = 3;
  var publicRSAKey = {};

  function Grapevine(options) {
    var self = this;
    id = self.id = createUniqueId({ length:19 });
    self.messages = messages;
    self.children = children;
    self.parents = parents;
    self.onMessage = function (message) { console.log('received: ', message); }

    function createUniqueId(options) {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for( var i=0; i < ((options && options.length) || 12); i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }
  }

  // options = {
  //   host: 'localhost',
  //   port: 3000,
  //   peerEndpoint: '/webrtc'
  //   childrenEndpoint: '/children'
  //   publicKeyEndpoint: '/publickey'
  // }
  Grapevine.prototype.connect = function(options) {
    var self = this;
    var thisPeer = new Peer(self.id, {
      host: options.host,
      port: options.port,
      path: options.peerEndpoint
    });

    thisPeer.on('open', function(id) {
      var fullChildrenEndpoint = 'http://' + options.host + ':' + options.port + options.childrenEndpoint;
      makeRequest(fullChildrenEndpoint, function(childIds) {
        childIds.forEach(function(childId) {
          var peerDataConnection = thisPeer.connect(childId);
          handlePeerConnection(thisPeer, peerDataConnection, { isChild: true });
        });
      });
      var fullPublicKeyEndpoint = 'http://' + options.host + ':' + options.port + options.publicKeyEndpoint;
      makeRequest(fullPublicKeyEndpoint, function(data) {
        var n = new BigInteger(); // from jsrsasign>ext>jsbn.js
        n.fromRadix(data.nRadix);
        data.publicRSAKey.n = n;
        publicRSAKey = KEYUTIL.getKey(data.publicRSAKey);
        console.log('retrieved publicRSAKey',publicRSAKey);
      });
    });

    thisPeer.on('server-message', processMessage);

    thisPeer.on('connection', function(peerDataConnection) {
      handlePeerConnection(thisPeer, peerDataConnection, { isChild:false });
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

  function handlePeerConnection(thisPeer, peerDataConnection, options) {
    // A peer connects
    peerDataConnection.on('open', function() {
      var parentsOrChildren = options.isChild ? children : parents;
      parentsOrChildren.push({ id: peerDataConnection.peer, peerDataConnection:peerDataConnection, status:'connected' });
      console.log('children: ', children);
      console.log('parents: ', parents);
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

  function whenAPeerClosesConnection(peerId, thisPeer, parents, children) {
    findPeerByID(peerId, parents, children).status = 'closed';
    var allParentsAreClosed = parents.reduce(function(areAllClosed, parent) { return areAllClosed && parent.status === 'closed' ? true : false; }, true);
    if(allParentsAreClosed) {
      console.log('I`ve become an orphan. Reconnecting...');
      thisPeer.reconnect();
    }
  }

  function findPeerByID(id, parents, children) {
    // TODO: refactor
    console.log(parents);
    console.log(children);
    var parentsIndex = -1, childrenIndex = -1;
    if (parents) {
      parentsIndex = parents.map(function(peer) { return peer.id; }).indexOf(id);
    }
    if (children) {
      childrenIndex = children.map(function(peer) { return peer.id; }).indexOf(id);
    }

    return ~parentsIndex ? parents[parentsIndex] : children[childrenIndex];
  }

  function processMessage(message) {
    // TODO interact with user-supplied callback
    if(!alreadyReceived(message) && verifiedFromServer(message.signedJSONWebSignature, publicRSAKey)) {
      messages.push(message);
      self.onMessage(message);
      sendToAllConnections(message);
    }

    function alreadyReceived(message){
      var messageIndex = messages.map(function(message){ return message.timestamp; }).indexOf(message.timestamp);
      return ~messageIndex ? true: false;
    }
    function verifiedFromServer(signedJSONWebSignature, serverPublicRSAKey){
      var isValid = KJUR.jws.JWS.verify(signedJSONWebSignature, serverPublicRSAKey, ['RS256']);
      console.log('valid?', !!isValid);
      return !!isValid;
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
    findPeerByID(peerId, parents, children).peerDataConnection.send(data);
  }

  function makeRequest(url, callback) {
    var httpRequest;
    if (window.XMLHttpRequest) {
      httpRequest = new XMLHttpRequest();
    }
    if (!httpRequest) {
      // TODO: handle this error
      return false;
    }
    httpRequest.onreadystatechange = responseHandler; // res
    httpRequest.open('GET', url);
    httpRequest.send();

    function responseHandler() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          // TODO: parse / deal with responseText
          callback(JSON.parse(httpRequest.responseText));
        } else {
          alert('There was a problem with the request.');
        }
      }
    }
  }

  return Grapevine;
})();
