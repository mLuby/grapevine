var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';

console.log('host',host,'port',port);

var server = app.listen(port);

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
