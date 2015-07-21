// TODO ability to send message from server to currentLayer Peers

// INITIALIZATION
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var server = app.listen(port, function(){
  console.log('Grapevine server live at', host+':'+port);
});
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
// curl -H "Content-Type: application/json" -X POST -d '{"total":100}' http://localhost:3000/message

var ExpressPeerServer = require('peer').ExpressPeerServer;
var expressPeerServer = ExpressPeerServer(server, {});

var maxPeersPerLayer = 3;
var currentLayer  = []; // new connections; parents to previous layer.
var previousLayer = []; // old connections; children to current layer.
// generate RSA keys for signing and verifing messages from server
var jsrsasign = require('jsrsasign');
var RSAkeys = jsrsasign.KEYUTIL.generateKeypair("RSA", 1024);
var publicRSAKey = RSAkeys.pubKeyObj;
var privateRSAKey = RSAkeys.prvKeyObj;

// ENDPOINTS
app.use('/', express.static('peerjs-client'));

app.use('/webrtc', expressPeerServer);

app.get('/publicKey', function (req, res) {
  return res.send(publicRSAKey);
});

app.get('/children', function (req, res) {
  return res.send(previousLayer);
});

app.post('/message', function(req, res) {
  // TODO: make sure _clients is consistent with currentLayer
  if (expressPeerServer._clients.peerjs) {
    var peerIds = Object.keys(expressPeerServer._clients.peerjs)
    console.log('sending req.body', req.body, 'to', peerIds);
    peerIds.forEach(function(peerId){
      sendMessageToPeerId(req.body, peerId);      
    });
  } else {
    console.log('No clients are currently connected to the server.');
  }
  return res.sendStatus(200);
});

function sendMessageToPeerId(message, peerId){
  var signedData = 'bob';//signJSON(message, privateRSAKey);
  var peer = expressPeerServer._clients.peerjs[peerId];
  console.log('server signed', message, 'to', signedData, 'for peer', peerId);
  peer.socket.send(JSON.stringify({ type:'MESSAGE', payload:signedData }));  
}

function signJSON(jsonObject, privateRSAKey){
  var signedJSONWebSignature = KJUR.jws.JWS.sign('RS256', JSON.stringify({alg: 'RS256'}), jsonObject, privateRSAKey);
  // console.log('RS256', JSON.stringify({alg: 'RS256'}), jsonObject, privateRSAKey,'=>',signedJSONWebSignature);
  return signedJSONWebSignature;
}

expressPeerServer.on('connection', function (id) {
  // The 'connection' event is emitted when a peer connects to the server.
  console.log('Peer',id,'connected to server');
  // if current layer has filled up
  if(currentLayer.length >= maxPeersPerLayer){
    // current layer becomes previous layer
    console.log('current layer',currentLayer,'becomes previous layer',previousLayer);
    previousLayer = currentLayer;
    currentLayer = [];
  }
  // add peer to current layer
  currentLayer.push(id);
});

expressPeerServer.on('disconnect', function (id) {
  // The 'disconnect' event is emitted when a peer disconnects from the server
  // or when the peer can no longer be reached.
  console.log('peer',id,'disconnected from server');
  // If in current layer, remove it.
  // var currentLayerIndex = currentLayer.indexOf(id);
  // if(currentLayerIndex !== -1){
  //   console.log('removed',id,'from current layer');
  //   currentLayer.splice(currentLayerIndex, 1);
  // }
});

