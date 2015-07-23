'use strict';

var ExpressPeerServer = require('peer').ExpressPeerServer;
var GrapevineServer, currentLayer = [], previousLayer = [], maxPeersPerLayer = 3;

function setup(server, options) {
  GrapevineServer = ExpressPeerServer(server, options);
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
  return GrapevineServer;
}

function messageAll(message) {
  // TODO: JSONify message here
  if (GrapevineServer._clients.peerjs) {
    var peerIds = Object.keys(GrapevineServer._clients.peerjs);
    peerIds.forEach(function(peerId) {
      messageIndividual(message, peerId);
    });
  }
}

function messageIndividual(message, peerId) {
  // TODO: encrypt message
  var peer = GrapevineServer._clients.peerjs[peerId];
  peer.socket.send(JSON.stringify({ type: 'MESSAGE', payload: message }));
}

function getChildren() {
  return previousLayer;
}

module.exports = {
  setup: setup,
  messageAll: messageAll,
  getChildren: getChildren,
};
