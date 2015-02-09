
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
    var mySocket = io.connect('https://localhost:3412'); //this needs to be passed the socket of the server
    
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
    
    //running log of data pushed from the database
    $scope.logData = [];
    
    //On update push the new data to the logData array
    socket.on('update', function (data) {
        $scope.logData.push(data);
    });

})
