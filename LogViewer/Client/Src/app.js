
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
    
    $scope.clearLog = function () {
        $scope.logData = [];
        $scope.selectedLog = null;
    }

    $scope.selectLog = function (data) {
        $scope.selectedLog = data;
    };
    
    $scope.truncate = function (txt) {
        if (!txt) {
            return [];
        }
        var lines = txt.split('\n');
        if (lines.length == 0) {
            return [];
        }
        var firstLine = lines[0];
        var maxLineLen = 100;
        if (firstLine.length > maxLineLen) {
            firstLine = firstLine.substring(0, maxLineLen);
        }
        return firstLine + "...";
    };
    
    ///
    /// The update function from the server
    ///
    socket.on('update', function (data) {
        console.log('update received from server. New log: ' + data.RenderedMessage.toString());
        $scope.logData.splice(0, 0, data);
        $scope.selectedLog = data;
    })
})
