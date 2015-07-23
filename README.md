#Grapevine

##Example
**server.js**
```node
var express = require('express');
var Grapevine = require('grapevine-server');
var app = express();
var server = app.listen(3000);

app.use('/peer-endpoint', Grapevine.setup(server, {}));
app.get('/sendMessage', function(req, res){
  Grapevine.messagePeers('hello world');
  return res.sendStatus(200);
});
```
**index.html**
```html
<script src="grapevine-client.js"></script>
<script>
  Grapevine.connect('//myServerUrl.com/peer-endpoint');
  Grapevine.onMessage(function(message){
    console.log('received message through Grapevine', message);
  });
  Grapevine.messagePeers({hello:'world'});
</script>
```
