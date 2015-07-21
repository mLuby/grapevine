var express = require('express');
var app = express();
var server = require('http').Server(app);

server.listen(3000);

app.use(express.static(__dirname + '/client'));

var maxPeersPerLayer = 3;
var currentLayer  = [];
var previousLayer = [];

app.on('peer-connection', function (peer) {
  console.log('peer',peer.id,'connected to server');
  // if current layer has filled up
  if(currentLayer.length >= maxPeersPerLayer){
    // current layer becomes previous layer
    previousLayer = currentLayer;
    currentLayer = [];
  }
  // add peer to current layer
  currentLayer.push(peer);
  // connect to each peer as parent
  var connectToPeer = connectFromPeer(peer); // curry'd 
  previousLayer.forEach(connectToPeer);
});

app.send('message', function(message){
  currentLayer.forEach(sendMessage);
});

function sendMessage(peer){
  // sign message
  var signedMessage = sign(message);
  // sign message
  peer.send(signedMessage);
};
