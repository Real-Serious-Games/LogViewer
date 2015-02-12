
//
// Define the 'app' module.
//
angular.module('app', [
    'btford.socket-io',
])

//
// Create the socket using the socket.io service's factory
//
.factory('socket', function (socketFactory) {
    var mySocket = io.connect('http://localhost:3412'); //this needs to be passed the socket of the server
    
    socket = socketFactory({
        ioSocket: mySocket
    });
    return socket;
})

//
// Application controller.
//
.controller('AppCtrl', function AppCtrl($scope, socket) {
    //
    // Setup the application data-model.
    //
    $scope.dataBindingTest = "Hello World";
    
    //
    // Request the server connect to the given database collection
    //
    $scope.connectToDB = function (host, database, collection) {
        socket.emit("connectToDB", host, database, collection);
    };
})
