/*
[x] v0 establish connection with a peer
[x] v0 share an update with a peer
[x] v0 receive an update from a peer
[x] v0 change DOM element based on update from peer
[ ] v1 verify update from a peer is valid
[ ] v1 request additional peers connection with a peer
  */
var startTime = (new Date()).getTime()%100;
function timeInSeconds() {
  startTime += 1;
  return startTime%100;
}

var thisPeer = new Peer(timeInSeconds(), {host: 'localhost', port: 9000, path: '/'});
console.log('my id is',thisPeer.id);
document.getElementById('id').textContent = "id: "+thisPeer.id;

var peers = [];

// attempt connection every second
var interval;
(function start(){
  interval = setInterval(function(){
    var testId = String(timeInSeconds());
    console.log('trying',testId);
    connect(testId);
  }, 10);
})();
function stop() {
  window.clearInterval(interval);
}

function connect(peerId){
  var peer = thisPeer.connect(peerId);
  handleOpenConnection(peer);
}

// connection attempt
thisPeer.on('connection', function(peer) {
  handleOpenConnection(peer);
});

function handleOpenConnection(peer){
  // connection open
  peer.on('open', function(){
    peers.push(peer);
    console.log('connection opened with', peer.peer);

    // message received
    peer.on('data', function(update) {
      console.log('data from', peer, 'sent', update);
      updateElementByClass(update.class, update.content);
    });
  });
}

function updateClassWithContent(className, content) {
  var update = {class:className, content:content};
  // update self
  updateElementByClass(update.class, update.content);
  // tell peers to update selves
  peers.forEach(function(peer){
    peer.send(update);
  });
};

function updateElementByClass(className, content) {
  var elementsToUpdate = document.getElementsByClassName(className);
  for(var i = 0; i < elementsToUpdate.length; i++){
    elementsToUpdate[i].textContent = content;
  }
}

