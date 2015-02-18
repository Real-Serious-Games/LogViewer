
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

    //running log of data received from the server
    $scope.logData = [];
    
    $scope.selectedLog = null;
    

    $scope.selectLog = function (data) {
        $scope.selectedLog = data;
    };
    
    ///
    /// The update function from the server
    ///
    socket.on('update', function (data) {
        $scope.logData.splice(0, 0, data);
        $scope.selectedLog = data;
    })
})
