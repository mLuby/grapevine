'use strict';

var Grapevine = (function() {
  var children = [], parents = [], messages = [];

  function Grapevine(options) {
    var self = this;
    self.id = makeId();
    self.peer = new Peer(self.id, options);

    peer.on('connection', function(dataConnection) {
      handleOpenConnection(dataConnection, { isChild: false });
    })
  }

  Grapevine.prototype.connect = function(url) {

  }

  function handleOpenConnection(dataConnection, options){
    dataConnection.on('open', function() {
      var parentsOrChildren = options.isChild ? children : parents;
      parentsOrChildren.push({ id: dataConnection.peer, dataConnection: dataConnection, status:'connected' });

      if(context.data.parents.length >= context.data.expectedNumParents){
        discon();
      }
    });

    dataConnection.on('data', processMessage);

    dataConnection.on('close', function() {
      // console.log('dataConnection close', dataConnection.peer, dataConnection.open);
      findPeerByID(dataConnection.peer).status = 'closed';

      var allParentsAreClosed = context.data.parents.reduce(function(areAllClosed, parent){
        return areAllClosed && parent.status === 'closed' ? true : false;
      }, true);

      if(allParentsAreClosed) {
        console.log('I\'ve become an orphan. Reconnecting...');
        context.data.peer.reconnect();
      }

      $rootScope.$digest(); // ugly hack because of service's async non-ng .on() listeners
    });

    dataConnection.on('error', function(err) {
      // console.log(dataConnection.peer, dataConnection.open, 'dataConnection error', err);
    });
  }

  return Grapevine;;

})();

function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 19; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
