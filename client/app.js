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
    update: update
  };

  // init
  var startTime = (new Date()).getTime()%1000000;
  context.data.id = startTime;
  // var self = new Peer(context.data.id, {host: 'iggrtc.azurewebsites.net', path: '/api'}); // port: 3000
  var self = new Peer(context.data.id, {key: 'lwjd5qra8257b9'});
  console.log('self', self);
  // connection attempt
  self.on('connection', function(connection) {
    console.log('connection from', connection.peer);
    handleOpenConnection(connection);
  });

  function connect(peerId){
    var connection = self.connect(peerId);
    handleOpenConnection(connection);
  }

  function update(value){
    console.log('sending value', value);
    context.data.peers.forEach(function(peer){
      peer.connection.send(value);
    });
    context.data.updates.push({timestamp:Date.now(), peer:context.data.id, value:value});
  }

  function handleOpenConnection(connection){
    // connection open
    connection.on('open', function(){
      console.log('opened', connection.peer);
      context.data.peers.push({id:connection.peer, connection:connection, status:'connected'});
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    connection.on('data', function(value) {
      console.log('data from', connection.peer, 'sent', value);
      context.data.updates.push({timestamp:Date.now(), peer:connection.peer, value:value});
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    connection.on('close', function() { // connection is destroyed
      console.log('closed', connection.peer);
      findPeerByID(connection.peer).status = 'closed';
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    connection.on('disconnect', function() { // TODO connection discon from server but maintains connections
      console.log('peer',connection.peer,'disconnected from server',arguments);
      findPeerByID(connection.peer).status = 'disconnected';
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    function findPeerByID(id){
      return context.data.peers[context.data.peers.map(function(peer){ return peer.id; }).indexOf(id)];
    }
  }

  return context.data;
}]);