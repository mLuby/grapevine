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
f.connect({host: 'localhost', port: 3000, path: '/webrtc'});
console.log(f);
