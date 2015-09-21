

//
// Define the 'app' module.
//
angular.module('app', [
    'btford.socket-io',
    'app.directives',
    'angularMoment'
])

.constant('angularMomentConfig', {
    timezone: '+1000'
})

//
// Application controller.
//
.controller('AppCtrl', function AppCtrl($scope, $http, $log, socketFactory) {

    //running log of data received from the server
    var logData = [];

    //a subset of logData with the current filterText applied to it
    var filteredLogs = logData;

    //the currently truncated subsection of filteredLogs that we are rendering, using an infinite scroll to 
    //append more filtered logs when needed
    $scope.visibleLogs = logData;

    //current text filter to apply to the logData to produce the filteredLogs
    $scope.filterText = "";
    
    //currently selected log
    $scope.selectedLog = null;

    //The number of logs to add to the ng-repeat each time the infinite scoll function is called
    $scope.infiniteScollSize = 30;

    $scope.isValidQuery = true;

    $scope.filteredLogCount;

    $scope.query = "";
    $scope.propertyQuery = "AppInstanceID";

    var parser = null;
    var parsedFilter = null;

    ///set up the query language
    $http.get('Src/query.pegjs')
        .then(function (result) {
            parser = PEG.buildParser(result.data);
        })
        .then(function () {
            return $http.get('logs');
        })
        .then(function (results) {
            assert.isArray(results.data);

            logData = results.data;
            logData = Enumerable.from(logData)
                .select(formatLog)
                .toArray();

            $scope.selectedLog = logData[0]; 
            applyFilter();

            var socket = socketFactory();
            socket.on('update', function (newLog) {
                assert.isObject(newLog);

                logData.splice(0, 0, formatLog(newLog));
                applyFilter();
            });
        })
        .catch(function(err) {
            $log.error(err);
        });

    var formatLog = function (log) {

        //some logs seem not to have a timestamp on them 
        if(!log.Timestamp) {
            return log;
        }

        log.Timestamp = moment(log.Timestamp);
        log.Properties.Timestamp = log.Timestamp;
        return log;
    };

    ///
    ///Apply the current filter against the log data
    ///
    var applyFilter = function () {
        var filterText = $scope.filterText.trim();
        if(!filterText) {
            filteredLogs = logData;
        } 
        else {
            try {
                parsedFilter = parser.parse(filterText);
                filteredLogs = logData.filter(parsedFilter);
                $scope.isValidQuery = true;
            }
            catch (e) {
                console.log(e.message);
                $scope.isValidQuery = false;
            }   
        }
        $scope.filteredLogCount = filteredLogs.length;
        $scope.visibleLogs = [];
        $scope.addMoreLogs();
    };

    ///
    ///Recognise a change in the filter
    ///
    $scope.filterChanged = function () {
        applyFilter();
    };

    $scope.clearLog = function () {
        logData = [];
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

    ///
    ///Infinite scroll function
    ///
    $scope.addMoreLogs = function (deferredObj) {
        var index = $scope.visibleLogs.length;
        var remaining = filteredLogs.length - index;
        var numberOfNewItems = Math.min(remaining, $scope.infiniteScollSize);
        var newItems = filteredLogs.slice(index, index + numberOfNewItems);
        $scope.visibleLogs = $scope.visibleLogs.concat(newItems);
        if(deferredObj) {
            deferredObj.resolve();
        }
    }


    $scope.setPropertyQuery = function(property) {
        $scope.propertyQuery = property;
    };
});
