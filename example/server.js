var express = require('express');
var app = express();
var server = app.listen(3000, function(){
  console.log('Server listening at localhost:3000');
});

var Grapevine = require('grapevine-server');
Grapevine.setup('/webrtc', app, server);

app.get('/sendMessage', function(req, res){
  Grapevine.messageAll('hello world');
  return res.sendStatus(200);
});

app.use('/', express.static('client'));
