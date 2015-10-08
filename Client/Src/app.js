

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
    var queryFilteredLogs = logData;
    var textFilteredLogs = queryFilteredLogs;

    //the currently truncated subsection of filteredLogs that we are rendering, using an infinite scroll to 
    //append more filtered logs when needed
    $scope.visibleLogs = logData;

    //current text filter to apply to the logData to produce the filteredLogs
    $scope.queryText = "";
    $scope.filterText = "";
    
    //currently selected log
    $scope.selectedLog = null;

    //The number of logs to add to the ng-repeat each time the infinite scoll function is called
    $scope.infiniteScollSize = 30;

    $scope.isValidQuery = true;

    $scope.filteredLogCount = 0;

    $scope.query = "";
    $scope.propertyQuery = "AppInstanceID";

    var parser = null;

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
            applyQueryFilter();
            applyTextFilter();

            var socket = socketFactory();
            socket.on('update', function (newLog) {
                assert.isObject(newLog);

                logData.splice(0, 0, formatLog(newLog));
                applyQueryFilter();
                applyTextFilter();
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

    //
    // Apply the query filter.
    //
    var applyQueryFilter = function () {
        var queryText = $scope.queryText.trim();
        if (!queryText) {
            $scope.isValidQuery = true;
            queryFilteredLogs = logData;
        } 
        else {
            try {
                var parsedFilter = parser.parse(queryText);
                queryFilteredLogs = logData.filter(parsedFilter);
                $scope.isValidQuery = true;
            }
            catch (e) {
                console.error(e.message);
                $scope.isValidQuery = false;
            }   
        }
    };

    //
    // Apply the text filter.
    //
    var applyTextFilter = function () {
        var filterText = $scope.filterText.trim().toLowerCase();        
        if (!filterText) {
            textFilteredLogs = queryFilteredLogs;
        } 
        else {
            textFilteredLogs = queryFilteredLogs.filter(function (log) {
                    return JSON.stringify(log).indexOf(filterText) !==  -1;
                });
        }
        $scope.filteredLogCount = textFilteredLogs.length;
        $scope.visibleLogs = [];
        $scope.addMoreLogs();
    };

    ///
    ///Recognise a change in the filter
    ///
    $scope.queryChanged = function () {
        applyQueryFilter();
        applyTextFilter();
    };

    $scope.filterChanged = function () {
        applyTextFilter();
    };

    $scope.clearLog = function () {
        logData = [];
        queryFilteredLogs = [];
        textFilteredLogs = [];
        $scope.visibleLogs = [];
        $scope.filteredLogCount = 0;
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
        var remaining = textFilteredLogs.length - index;
        var numberOfNewItems = Math.min(remaining, $scope.infiniteScollSize);
        var newItems = textFilteredLogs.slice(index, index + numberOfNewItems);
        $scope.visibleLogs = $scope.visibleLogs.concat(newItems);
        if(deferredObj) {
            deferredObj.resolve();
        }
    }
});
