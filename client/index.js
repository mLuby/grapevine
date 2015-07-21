var Socketiop2p = require('./socketio-p2p-client.js');

function init () {
  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: true};
  var p2psocket = new Socketiop2p(socket, opts, function () {
    console.log('My id is', p2psocket.peerId);
    myPeerId.innerHTML = 'My id is '+p2psocket.peerId;
  });

  // Elements
  var form = document.getElementById('msg-form');
  var box = document.getElementById('msg-box');
  var myPeerId = document.getElementById('my-peer-id');
  var peerList = document.getElementById('peer-list');
  var msgList = document.getElementById('msg-list');
  var upgradeMsg = document.getElementById('upgrade-msg');

  p2psocket.on('peer-msg', function(data) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(data));
    msgList.appendChild(li);
  });

  p2psocket.on('peer-signal', function(data) {
    // console.log('peer-signal', data);
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(data.fromPeerId));
    peerList.appendChild(li);
  });

  form.addEventListener('submit', function(e, d) {
    e.preventDefault();
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(box.value));
    msgList.appendChild(li);
    p2psocket.emit('peer-msg', box.value)
    box.value = '';
  });

  var debugButton = document.getElementById('debug');
  debugButton.addEventListener('click', function(e) {
    p2psocket;
    Socketiop2p;
    debugger;
  })
}

document.addEventListener('DOMContentLoaded', init, false)
