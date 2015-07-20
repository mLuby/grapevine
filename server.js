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
server.on('connection', function(id) {
  // console.log('connection from id',id);
  // peers.push(id);
});

server.on('disconnect', function(id) { 
  // console.log('disconnect from id',id);
  // peers.splice(peers.indexOf(id), 1);
});