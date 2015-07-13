var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

var server = app.listen(3000);

var options = {
//   debug: true
};

app.use('/api', ExpressPeerServer(server, options));
app.use(express.static('client'));

var peers = [];
server.on('connection', function(peer) {
  // console.log(peer.id,'connection from id',peer.peer);
  // peers.push(id);
});
