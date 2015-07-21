var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var p2p = require('socket.io-p2p-server').Server;
io.use(p2p);

server.listen(3000);

app.use(express.static(__dirname + '/client'));

io.on('connection', function (socket) {
  console.log('io on connection', socket.id);
});

io.on('close', function (socket) {
  console.log('io on close', socket.id);
});

io.on('disconnect', function (socket) {
  console.log('io on disconnect', socket.id);
});

io.on('leave', function (socket) {
  console.log('io on leave', socket.id);
});
