var app = angular.module('grapevine', []);

app.controller('grapevineController', ['Grapevine', '$scope', ctrl]);

function ctrl(Grapevine, $scope){
  this.gv = Grapevine;
};

app.service('Grapevine', ['$rootScope', function Grapevine($rootScope){
  var context = this;
  context.data = {
    id: '',
    peers: [],
    connect: connect,
    updates: [],
    connectionSend: sendToConnection,
    connectionsBroadcast: sendToAllConnections,
    connectionClose: closeConnection
  };

  // init
  var startTime = (new Date()).getTime()%1000000;
  context.data.id = startTime;
  // var peer = new Peer(context.data.id, {host: 'iggrtc.azurewebsites.net', path: '/api'}); // port: 3000
  context.data.peer = new Peer(context.data.id, {host: 'localhost', port: 3000, path: '/api'});//{key: 'lwjd5qra8257b9'});
  // var peer = new Peer(context.data.id, {key: 'lwjd5qra8257b9'});
  
  // peer (self) functionality
  context.data.peer.on('connection', function(dataConnection) {
    console.log('peer dataConnection from'+dataConnection.peer);
    handleOpenConnection(dataConnection);
  });

  context.data.peer.on('open', function(id) {
    console.log('peer open, id:'+id);
  });

  context.data.peer.on('close', function() {
    console.log('peer close');
  });

  context.data.peer.on('disconnected', function() {
    console.log('peer disconnected');
    // context.data.id += 1;
    console.log('reconnecting with id', context.data.id);
    context.data.peer = new Peer(context.data.id, {host: 'localhost', port: 3000, path: '/api'});//{key: 'lwjd5qra8257b9'});
    $rootScope.$digest();
  });

  context.data.peer.on('error', function(err) {
    console.log('peer error',err);
  });

  context.data.peerDisconnect = context.data.peer.disconnect;
  context.data.peerReconnect = context.data.peer.reconnect;
  context.data.peerDestroy = context.data.peer.destroy;    

  function updatePeerValues(){
    context.data.peer_id = context.data.peer.id 
    context.data.peer_connections = context.data.peer.connections 
    context.data.peer_disconnected = context.data.peer.disconnected 
    context.data.peer_destroyed = context.data.peer.destroyed 
  }


  // dataConnection functionality
  function connect(peerId){
    var dataConnection = context.data.peer.connect(peerId);
    handleOpenConnection(dataConnection);
  }

  function handleOpenConnection(dataConnection){
    dataConnection.on('open', function() { 
      console.log(dataConnection.peer, dataConnection.open, 'dataConnection open');

      context.data.peers.push({id:dataConnection.peer, dataConnection:dataConnection, status:'connected'});
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    dataConnection.on('data', function(data) {
      console.log(dataConnection.peer, dataConnection.open, 'dataConnection data', data);

      console.log('data from', dataConnection.peer, 'sent', data);
      context.data.updates.push({timestamp:Date.now(), peer:dataConnection.peer, data:data});
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    dataConnection.on('close', function() { 
      console.log(dataConnection.peer, dataConnection.open, 'dataConnection close');

      findPeerByID(dataConnection.peer).status = 'closed';
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    dataConnection.on('error', function(err) { 
      console.log(dataConnection.peer, dataConnection.open, 'dataConnection error', err);
    });
  }

  function sendToConnection(peerId, data){
    console.log('sending',data,'to',peerId);
    findPeerByID(peerId).dataConnection.send(data);
    console.log('sent',data,'to',peerId);
  }

  function sendToAllConnections(data){
    console.log('sending',data,'to all connections');
    context.data.peers.forEach(function(peer){
      sendToConnection(peer.id, data);
    });
    context.data.updates.push({timestamp:Date.now(), peer:context.data.id, data:data});
    console.log('sent',data,'to all connections');
  }

  function closeConnection(peerId){
    console.log('closing',peerId);
    findPeerByID(peerId).dataConnection.close();
    $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    console.log('closed',peerId);
  }

  function findPeerByID(id){
    return context.data.peers[context.data.peers.map(function(peer){ return peer.id; }).indexOf(id)];
  }

  return context.data;
}]);