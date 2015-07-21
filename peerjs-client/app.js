// TODO self-disconnect when has enough parents

var app = angular.module('grapevine', []);

app.controller('grapevineController', ['Grapevine', '$scope', ctrl]);

function ctrl(Grapevine, $scope){
  this.gv = Grapevine;
};

app.service('Grapevine', ['$http', '$rootScope', function Grapevine($http, $rootScope){
  var context = this;
  context.data = {
    id: '',
    expectedNumParents: 3,
    parents: [],
    children: [],
    messages: [],
    sendToAllConnections: sendToAllConnections,
    discon: discon,
    peerStatus: peerStatus
  };
  function peerStatus(string){
    if(context.data.peer.destroyed){
      return 'closed';
    } else {
      return context.data.peer.disconnected ? 'disconnected' : 'connected';
    }
    // $rootScope.$digest();
  }

  function discon(){
    console.log('peer',context.data.peer);
    console.log('auto-disconnecting');
    context.data.peer.disconnect();
    console.log('auto-disconnected');
    console.log('peer',context.data.peer);
  };

  // init
  var startTime = (new Date()).getTime()%1000000;
  context.data.id = startTime;
  context.data.peer = new Peer(context.data.id, {host: 'localhost', port: 3000, path: '/webrtc'});

  // peer (self) functionality
  context.data.peer.on('connection', function(dataConnection) {
    console.log('peer dataConnection from', dataConnection.peer);
    handleOpenConnection(dataConnection, {isChild: false});
  });

  context.data.peer.on('open', function(id) {
    console.log('peer', id,'open');
    $http.get('http://localhost:3000/children').success(function(childrenIds){
      console.log('children', childrenIds);
      childrenIds.forEach(function(childId){
        var dataConnection = context.data.peer.connect(childId);
        handleOpenConnection(dataConnection, {isChild: true});
      });
    });
  });

  context.data.peer.on('close', function() {
    // TODO
    console.log('peer close');
  });

  context.data.peer.on('disconnected', function() {
    console.log('peer disconnected');
    // console.log('reconnecting with id', context.data.id);
    // context.data.peer = new Peer(context.data.id, {host: 'localhost', port: 3000, path: '/api'});//{key: 'lwjd5qra8257b9'});
    $rootScope.$digest();
  });

  context.data.peer.on('error', function(err) {
    console.warn('peer error',err);
  });

  context.data.peer.on('server-update', function(msg) {
    // TODO: fill in
    console.log('got a server update');
    console.log(msg);
  });
  function handleOpenConnection(dataConnection, options){
    dataConnection.on('open', function() {
      console.log('dataConnection open', dataConnection.peer, dataConnection.open);
      var parentsOrChildren = options.isChild ? context.data.children : context.data.parents;
      parentsOrChildren.push({id:dataConnection.peer, dataConnection:dataConnection, status:'connected'});
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners

      if(context.data.parents.length >= context.data.expectedNumParents){
        discon();
      }
    });

    dataConnection.on('data', processMessage);

    dataConnection.on('close', function() {
      console.log('dataConnection close', dataConnection.peer, dataConnection.open);
      findPeerByID(dataConnection.peer).status = 'closed';

      parentClosedStatuses = context.data.parents.map(
        function(parent){
          return parent.status == 'closed' ? true : false;
        }
      );
      if(!_.contains(parentClosedStatuses, false)) {
        console.log('All parents are dead, I am an orphan');
        context.data.peer.reconnect();
      }

      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    dataConnection.on('error', function(err) {

      console.log(dataConnection.peer, dataConnection.open, 'dataConnection error', err);
    });
  }

  function closeConnection(peerId){
    console.log('closing',peerId);
    findPeerByID(peerId).dataConnection.close();
    $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    console.log('closed',peerId);
  }

  function findPeerByID(id){
    var parentsIndex = context.data.parents.map(function(peer){ return peer.id; }).indexOf(id);
    var childrenIndex = context.data.children.map(function(peer){ return peer.id; }).indexOf(id);
    if(parentsIndex !== -1){
      return context.data.parents[parentsIndex];
    } else {
      return context.data.children[childrenIndex];
    }
  }

  function processMessage(message){
    console.log('Processing message.');

    if(!alreadyReceived(message) && verifiedFromServer(message)) {
      context.data.messages.push(message);
      sendToAllConnections(message);
      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    }
    function alreadyReceived(message){
      var messageIndex = context.data.messages.map(function(message){ return message.timestamp; }).indexOf(message.timestamp);
      if(messageIndex !== -1){
        return true;
      } else {
        return false;
      }
    }
    function verifiedFromServer(message){
      // TODO
      return true;
    }
  }

  function sendToAllConnections(message){
    console.log('sending',message,'to all connections');
    message.timestamp = message.timestamp || (new Date()).getTime()
    context.data.children.forEach(function(child){
      sendToConnection(child.id, message);
    });
  }

  function sendToConnection(peerId, data){
    console.log('sending',data,'to',peerId);
    findPeerByID(peerId).dataConnection.send(data);
  }

  return context.data;
}]);
