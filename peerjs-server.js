var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var server = app.listen(port, function(){
  console.log('Grapevine server live at', host+':'+port);
});
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var options = {
    debug: true,
    allow_discovery: true
};
var ExpressPeerServer = require('peer').ExpressPeerServer;
var expressPeerServer = ExpressPeerServer(server, options);

app.use('/', express.static('peerjs-client'));
app.use('/api', expressPeerServer);
app.get('/list', function (req, res) {
  // Throws a fit if peers have never existed.
  var peers = Object.keys(expressPeerServer._clients.peerjs);
  return res.send({currentLayer:currentLayer, previousLayer:previousLayer, peers:peers}); 
});
app.get('/children', function (req, res) {
  // Throws a fit if peers have never existed.
  return res.send(previousLayer);
});
app.post('/message', function(req, res){
  console.log('req.body',req.body);
  currentLayer.forEach(sendMessage);
});

expressPeerServer.on('connection', function (id) {
  // The 'connection' event is emitted when a peer connects to the server.
  console.log('peer',id,'connected to server');
  // if current layer has filled up
  if(currentLayer.length >= maxPeersPerLayer){
    // current layer becomes previous layer
    console.log('current layer',currentLayer,'becomes previous layer',previousLayer);
    previousLayer = currentLayer;
    currentLayer = [];
  }
  // add peer to current layer
  currentLayer.push(id);
  // connect to each peer as parent
  var connectToPeer = connectFromPeer(id); // curry'd 
  previousLayer.forEach(connectToPeer);
});

expressPeerServer.on('disconnect', function (id) {
  // The 'disconnect' event is emitted when a peer disconnects from the server 
  // or when the peer can no longer be reached.
  console.log('peer',id,'disconnected from server');
});

var maxPeersPerLayer = 3;
var currentLayer  = [];
var previousLayer = [];

function sendMessage(peer){
  // sign message
  var signedMessage = sign(message);
  // sign message
  peer.send(signedMessage);
};

function connectFromPeer(){ return function(){}; }
