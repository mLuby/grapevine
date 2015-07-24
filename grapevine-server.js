(function(){
  'use strict';

  var ExpressPeerServer = require('peer').ExpressPeerServer;
  var GrapevineServer, currentLayer = [], previousLayer = [], maxPeersPerLayer = 3;
  // generate RSA keys for signing and verifing messages from server
  var jsrsasign = require('jsrsasign');
  var _RSAkeys = jsrsasign.KEYUTIL.generateKeypair("RSA", 1024);
  var publicRSAKey = _RSAkeys.pubKeyObj;
  var privateRSAKey = _RSAkeys.prvKeyObj;

  module.exports = {
    setup: setup,
    messageAll: messageAll,
    getChildren: getChildren,
    publicRSAKey: {publicRSAKey:publicRSAKey, nRadix:publicRSAKey.n.toRadix()}
  };

  function setup(app, server, options) {
    var Grapevine = this;
    GrapevineServer = ExpressPeerServer(server, options);

    app.use(options.peerEndpoint, GrapevineServer);
    app.get(options.childrenEndpoint, function(req, res){ return res.send(Grapevine.getChildren()); });
    app.get(options.publicKeyEndpoint, function(req, res){ return res.send(Grapevine.publicRSAKey); });

    GrapevineServer.on('connection', function (id) {
      // The 'connection' event is emitted when a peer connects to the server.
      // if current layer has filled up
      if(currentLayer.length >= maxPeersPerLayer){
        previousLayer = currentLayer;
        currentLayer = [];
      }
      currentLayer.push(id);

    });

    GrapevineServer.on('disconnect', function (id) {
      // The 'disconnect' event is emitted when a peer disconnects from the server
      // or when the peer can no longer be reached.
      console.log('peer',id,'disconnected from server');
    });
  }

  function messageAll(message) {
    // TODO: JSONify message here
    if (GrapevineServer._clients.peerjs) {
      var peerIds = Object.keys(GrapevineServer._clients.peerjs);
      peerIds.forEach(function(peerId) {
        messageIndividual(message, peerId);
      });
    }
    function messageIndividual(message, peerId) {
      // sign payload and include signature for client-side verification
      var payload = {
        message: message,
        signedJSONWebSignature: '',
        sender: 'SERVER',
        timestamp: new Date().getTime()
      }
      payload.signedJSONWebSignature = signJSON(payload);
      var peer = GrapevineServer._clients.peerjs[peerId];
      peer.socket.send(JSON.stringify({ type:'MESSAGE', payload:payload }));

      function signJSON(jsonObject){
        var signedJSONWebSignature = KJUR.jws.JWS.sign('RS256', JSON.stringify({alg: 'RS256'}), JSON.stringify(jsonObject), privateRSAKey);
        return signedJSONWebSignature;
      }
    }
  }

  function getChildren() {
    return previousLayer;
  }
})();
