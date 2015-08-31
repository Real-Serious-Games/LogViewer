

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

    $scope.visibleLogs = $scope.logData;

    $scope.filterText = "";
    
    $scope.selectedLog = null;

    $scope.query = "";
    $scope.propertyQuery = "AppInstanceID";

    var parser = null;
    var parsedFilter = null;

    $http.get('logs')
        .then(function(results) {
            assert.isArray(results.data);

            $scope.logData = results.data;
            $scope.selectedLog = $scope.logData[0];

            var socket = socketFactory();
            socket.on('update', function (newLog) {
                assert.isObject(newLog);

                $scope.logData.splice(0, 0, newLog); 
            });
        })
        .catch(function(err) {
            $log.error(err);
        });

    
    ///set up the query language
    $http.get('Src/query.pegjs')
        .then(function (result) {
            parser = PEG.buildParser(result.data);

            applyFilter();
        });

    ///
    ///Apply the current filter against the log data
    ///
    var applyFilter = function () {
        var filterText = $scope.filterText.trim();
        if(!filterText) {
            $scope.visibleLogs = $scope.logData;
            return;
        }

        parsedFilter = parser.parse(filterText);
        $scope.visibleLogs = $scope.logData.filter(parsedFilter);
    };

    ///
    ///Recognise a change in the filter
    ///
    $scope.filterChanged = function () {
        applyFilter();
    };

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
