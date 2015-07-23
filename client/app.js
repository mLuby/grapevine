// var app = angular.module('appThatUsesGrapevine', []);
//
// app.controller('aController', ['Grapevine', '$scope', function aController(aService, $scope){
//   this.gv = aService;
//   this.toHumanDateTime = function(t){ return (new Date(t)).toLocaleTimeString(); };
// }]);
//
// app.service('aService', ['$http', '$rootScope', function aService($http, $rootScope){
//   var context = this;
//   context.data = {
//     messages: [],
//   };
//   return context.data;
// }]);
var f = new Grapevine();
var options = {
  host: 'localhost',
  port: 3000,
  peerEndpoint: '/webrtc',
  childrenEndpoint: '/children'
};
f.connect(options);
console.log(f);
