var app = angular.module('grapevine', []);

app.controller('grapevineController', ['Grapevine', '$scope', ctrl]);

function ctrl(Grapevine, $scope){
  this.gv = Grapevine;
};

// ctrl.prototype.connect = function(peerID) {
//   console.log(this.peerID);
//   this.connect(this.peerID);
//   this.peerID = '';
// };

// ctrl.prototype.doSomething = function() {
//   console.log(this.peers);
// };

// app.filter('reverse', function() {
//   return function(items) {
//     return items && items.length ? items.slice().reverse() : [];
//   };
// });
// ctrl.prototype.sendUpdate = function(value) {
//   this.updates.push({value: value});
//   this.update = '';
// };


app.service('Grapevine', ['$rootScope', function Grapevine($rootScope){
  var context = this;
  context.data = {
    id: '',
    // server: {status:'??'},
    // updates: [],
    connect: connect,
    peers: []
  };

  // init
  var startTime = (new Date()).getTime()%1000000;
  context.data.id = startTime;
  var self = new Peer(context.data.id, {host: 'localhost', port: 3000, path: '/api'});
  console.log('self',self);

  function connect(peerId){
    var connection = self.connect(peerId);
    handleOpenConnection(connection);
  }

  // connection attempt
  self.on('connection', function(connection) {
    console.log('on cxn', connection.peer);
    handleOpenConnection(connection);
  });

  function handleOpenConnection(connection){
    // connection open
    connection.on('open', function(){
      console.log('opened', connection.peer);
      context.data.peers.push({id:connection.peer, status:'connected'});
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    connection.on('data', function(update) {
      console.log('data from', connection.peer, 'sent', update);
      context.data.updates.push({peer:connection.peer, value:update, time:Date.now()});
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