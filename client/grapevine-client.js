var Grapevine = (function () {
  'use strict';
  var expectedNumParents = 3;
  var publicRSAKey = {};

  var Grapevine = {
    id: '',
    children: {},
    parents: {},
    lastMessageReceivedAt: 0,
    connectToServer: connectToServer,
    onMessage: function onMessage(message){ console.log('default onMessage', message); }
  };

  // Initialization
  function connectToServer(options) {
    // options = {
    //   host: 'localhost',
    //   port: 3000,
    //   peerEndpoint: '/webrtc'
    //   childrenEndpoint: '/children'
    //   publicKeyEndpoint: '/publickey'
    // }

    Grapevine.id = createUniqueId({ length:19 });

    var thisPeer = new Peer(Grapevine.id, { host: options.host, port: options.port, path: options.peerEndpoint });

    thisPeer.on('open', function(id){
      // fetch and connect to children
      var fullChildrenEndpoint = 'http://' + options.host + ':' + options.port + options.childrenEndpoint; //TODO https issue?
      makeRequest(fullChildrenEndpoint, function(childIds){
        childIds.forEach(function(childId){
          var peerDataConnection = thisPeer.connect(childId);
          handlePeerConnection(thisPeer, peerDataConnection, { isChild: true });
        });
      });
      // fetch public key
      var fullPublicKeyEndpoint = 'http://' + options.host + ':' + options.port + options.publicKeyEndpoint;
      makeRequest(fullPublicKeyEndpoint, function(data){
        var n = new BigInteger(); // from jsrsasign > ext > jsbn.js
        n.fromRadix(data.nRadix);
        data.publicRSAKey.n = n;
        publicRSAKey = KEYUTIL.getKey(data.publicRSAKey);
        console.log('retrieved publicRSAKey',publicRSAKey);
      });
    });

    thisPeer.on('server-message', function(message){ processMessage(message, Grapevine.onMessage); });

    thisPeer.on('connection', function(peerDataConnection){ handlePeerConnection(thisPeer, peerDataConnection, { isChild:false }); })

    thisPeer.on('disconnected', function(){ console.log('this peer disconnected'); });

    thisPeer.on('close', function(){ console.log('this peer closed'); });

    thisPeer.on('error', function(err){ console.warn('this peer error',err); });

    function makeRequest(url, callback){
      var httpRequest;
      if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
      }
      if (!httpRequest) {
        // TODO: handle this error
        return false;
      }
      httpRequest.onreadystatechange = responseHandler;
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

    function createUniqueId(options){
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for( var i=0; i < (options && options.length || 12); i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }
  }

  // Event handling
  function handlePeerConnection(thisPeer, peerDataConnection, options){
    // A peer connects
    peerDataConnection.on('open', function() {
      var parentsOrChildren = options.isChild ? Grapevine.children : Grapevine.parents;
      parentsOrChildren[peerDataConnection.peer] = peerDataConnection;
      console.log('Added new peer to', options.isChild ? 'children' : 'parents', parentsOrChildren);
      // Auto-disconnect when this peer has enough parents.
      if(Object.keys(Grapevine.parents).length >= expectedNumParents){
        thisPeer.disconnect();
      }
    });

    // A peer sends data
    peerDataConnection.on('data', function(message){ processMessage(message, Grapevine.onMessage); });

    // A peer closes connection to this peer
    peerDataConnection.on('close', function(){
      delete Grapevine.parents[peerId];
      delete Grapevine.children[peerId];
      if(Object.keys(Grapevine.parents).length === 0) {
        console.log('I`ve become an orphan. Reconnecting...');
        thisPeer.reconnect();
      }
    });

    peerDataConnection.on('error', function(err) { console.log('peerDataConnection error', peerDataConnection, err); });
  }

  // Message handling
  function processMessage(message, callback){
    if(notYetReceived() && verifiedFromServer(message.signedJSONWebSignature, publicRSAKey)) {
      Grapevine.lastMessageReceivedAt = message.timestamp;
      sendToAllConnections(message);
      callback(message.message);
    }

    function notYetReceived(){
      console.log('notYetReceived?',message.timestamp > Grapevine.lastMessageReceivedAt, message.timestamp, Grapevine.lastMessageReceivedAt);
      return message.timestamp > Grapevine.lastMessageReceivedAt ? true : false;
    }

    function verifiedFromServer(signedJSONWebSignature, serverPublicRSAKey){
      var isValid = KJUR.jws.JWS.verify(signedJSONWebSignature, serverPublicRSAKey, ['RS256']);
      return !!isValid;
    }

    function sendToAllConnections(message){
      var temp = message.sender; // TODO -_-
      message.sender = Grapevine.id;
      Object.keys(Grapevine.children).forEach(function(childId){
        sendToChild(childId, message, Grapevine.children);
      });
      message.sender = temp;

      function sendToChild(peerId, message, children){
        var peerDataConnection = children[peerId];
        peerDataConnection.send(message);
      }
    }
  };

  return Grapevine;
})();
