var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var p2p = require('socket.io-p2p-server').Server;
io.use(p2p);

server.listen(3000);

app.use(express.static(__dirname + '/client'));

// app.get('/', function (req, res) {
//   res.sendfile(__dirname + '/client');
// });

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
