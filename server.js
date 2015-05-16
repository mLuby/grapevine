var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

var server = app.listen(3000);

var options = {
  debug: true
};

app.use('/api', ExpressPeerServer(server, options));
app.use(express.static('client'));

server.on('connection', function(id) {
  console.log('connection from id',id);
});
