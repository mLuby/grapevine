// TODO ability to send message from server to currentLayer Peers

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

app.use('/', express.static('peerjs-client'));
app.use('/webrtc', expressPeerServer);
app.get('/children', function (req, res) {
  return res.send(previousLayer);
});
app.post('/message', function(req, res) {
  console.log('req.body', req.body);

  // TODO: make sure _clients is consistent with currentLayer
  if (expressPeerServer._clients.peerjs) {
    console.log('Emitting update.');
    var peerIds = Object.keys(expressPeerServer._clients.peerjs);
    for (var id in peerIds) {
      var peer = expressPeerServer._clients.peerjs[peerIds[id]];
      peer.socket.send(JSON.stringify({ type: 'MESSAGE', payload: req.body }));
    }
  } else {
    console.log('No clients are currently connected to the server.');
  }

  return res.sendStatus(200);
});

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

var maxPeersPerLayer = 3;
var currentLayer  = []; // new connections; parents to previous layer.
var previousLayer = []; // old connections; children to current layer.
