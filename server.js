// TODO ability to send message from server to currentLayer Peers

// INITIALIZATION
var Grapevine = require('./grapevine-server');
var express = require('express');
var bodyParser = require('body-parser');
var jsrsasign = require('jsrsasign');

var app = express();
var port = process.env.PORT || 3000;
var host = process.env.HOST || '0.0.0.0';
var server = app.listen(port, function () {
  console.log('Grapevine server live at', host+':'+port);
});
app.use(bodyParser.json());
// curl -H "Content-Type: application/json" -X POST -d '{"total":100}' http://localhost:3000/message

// ENDPOINTS
app.use('/', express.static('client'));
app.use('/webrtc', Grapevine.setup(server, {}));

app.get('/children', function (req, res) {
  return res.send(Grapevine.getChildren());
});

var total = 0;
app.post('/message', function(req, res) {
  var message = {
    data: {},
    sender: 'SERVER',
    timestamp: new Date().getTime()
  };
  if (req.body.total) {
    total += req.body.total;
    message.data.total = total;
  }
  Grapevine.messageAll(message);
  return res.sendStatus(200);
});
