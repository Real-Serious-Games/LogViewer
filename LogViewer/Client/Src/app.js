

//
// Define the 'app' module.
//
angular.module('app', [
    'btford.socket-io',
])

//
// Application controller.
//
.controller('AppCtrl', function AppCtrl($scope, $http, $log, socketFactory) {

    //running log of data received from the server
    $scope.logData = [];
    
    $scope.selectedLog = null;

    $scope.query = "";
    $scope.propertyQuery = "AppInstanceID";

    $http.get('logs')
        .then(function(results) {
            assert.isArray(results.data);

            $scope.logData = results.data;
            $scope.selectedLog = $scope.logData[0];

            var socket = socketFactory();
            socket.on('update', function (newLog) {
                assert.isObject(newLog);

                $scope.logData.splice(0, 0, newLog);                
                $scope.selectedLog = newLog;
            });
        })
        .catch(function(err) {
            $log.error(err);
        });

    
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

    $scope.filterLogs = function(element) {
        if (!$scope.query) {
            return true;
        }

        var propertyValue = element.Properties[$scope.propertyQuery].toLowerCase();
        return propertyValue.indexOf($scope.query.toLowerCase()) >= 0;
    };

    $scope.setPropertyQuery = function(property) {
        $scope.propertyQuery = property;
    };
});
