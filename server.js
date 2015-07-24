// INITIALIZATION
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var server = app.listen(port, function () {
  console.log('Grapevine server live at', host+':'+port);
});
app.use(bodyParser.json());
// curl -H "Content-Type: application/json" -X POST -d '{"total":100}' http://localhost:3000/message

var Grapevine = require('./grapevine-server');
Grapevine.setup(app, server, {
  peerEndpoint: '/webrtc',
  childrenEndpoint: '/children',
  publicKeyEndpoint: '/publickey'
});

// ENDPOINTS
app.use('/', express.static('client'));

var total = 0;
app.post('/message', function(req, res) {
  var message = {};
  if (req.body.total) {
    total += req.body.total;
    message.total = total;
  }
  console.log('Message received:',req.body+'; Sending through the Grapevine as',message);
  Grapevine.messageAll(message);
  return res.sendStatus(200);
});
