﻿

//
// Define the 'app' module.
//
angular.module('app', [
    'btford.socket-io',
    'app.directives',
    'ui.router'
])

.config(function ($stateProvider, $urlRouterProvider) {
    
    $stateProvider
        .state('modal', {
            views: {
                "modal": {
                    templateUrl: "modal.html"
                }
            },
            onEnter: ['$state', function ($state) {
                $(document).on("keyup", function (e) {
                    if (e.keyCode == 27) {
                        $(document).off('keyup');
                        $state.go("default");
                    }
                });
                
                $(document).on('click', ".modal-backdrop, .modal-holder", function () {
                    $state.go("default");
                });
                
                $(document).on('click', ".modal-box, .modal-box *", function (e) {
                    e.stopPropagation();
                });
            }],
            abstract: true
        })
        .state('modal.selectedlog', {
            views: {
                "modal": {
                    templateUrl: './selectedlog.html'
                }
            }
        })
        .state('default', {});
})

//
// Application controller.
//
.controller('AppCtrl', function AppCtrl($scope, $http, $log, $state, socketFactory) {

    //running log of data received from the server
    var logData = [];
    

    //a subset of logData with the current filterText applied to it
    var queryFilteredLogs = logData;
    var textFilteredLogs = queryFilteredLogs;

    //the currently truncated subsection of filteredLogs that we are rendering, using an infinite scroll to 
    //append more filtered logs when needed
    $scope.visibleLogs = textFilteredLogs;

    //current text filter to apply to the logData to produce the filteredLogs
    $scope.queryText = "";
    $scope.filterText = "";
    
    //currently selected log
    $scope.selectedLog = null;

    //The number of logs to add to the ng-repeat each time the infinite scoll function is called
    var infiniteScrollSize = 200;

    //The number of logs received from the server so far.
    $scope.receivedLogCount = 0;

    $scope.isValidQuery = true;

    $scope.filteredLogCount = 0;

    $scope.query = "";

    var parser = null;

    ///set up the query language
    $http.get('Src/query.pegjs')
        .then(function (result) {
            parser = PEG.buildParser(result.data);
        })
        .then(function () {
            return requestLogsFromServer(0, infiniteScrollSize)
        })
        .then(function (incomingLogs) {
                
            $scope.receivedLogCount += incomingLogs.length;
            addMoreLogs(incomingLogs);

            var socket = socketFactory();
            socket.on('update', function (newLog) {
                assert.isObject(newLog);
                
                addLogsToTop(formatLog(newLog));
            });
        })
        .catch(function (err) {
            $log.error(err && err.stack || err);
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
    var applyQueryFilter = function (logsToFilter) {
        assert.isArray(logsToFilter);

        var queryText = $scope.queryText.trim();
        if (!queryText) {
            $scope.isValidQuery = true;
            return logsToFilter;
        } 
        else {
            try {
                var parsedFilter = parser.parse(queryText);
                $scope.isValidQuery = true;
                return logsToFilter.filter(parsedFilter);
            }
            catch (e) {
                console.error(e.message);
                $scope.isValidQuery = false;
                return logsToFilter;
            }   
        }
    };

    //
    // Apply the text filter.
    //
    var applyTextFilter = function (logsToFilter) {
        assert.isArray(logsToFilter);

        var filterText = $scope.filterText.trim().toLowerCase();        
        if (!filterText) {
            return logsToFilter;
        } 
        else {
            return logsToFilter.filter(function (log) {
                    return JSON.stringify(log).indexOf(filterText) !==  -1;
                });
        }
    };

    var updateVisibleLogs = function (logs) {
        assert.isArray(logs);

        $scope.visibleLogs = logs;
        $scope.filteredLogCount = logs.length;
    };

    //
    // Recognise a change in the filter
    //
    $scope.queryChanged = function () {
        queryFilteredLogs = applyQueryFilter(logData);
        textFilteredLogs = applyTextFilter(queryFilteredLogs);
        updateVisibleLogs(textFilteredLogs);

        if (textFilteredLogs.length < infiniteScrollSize) {
            populateMoreLogs(infiniteScrollSize);
        }
    };

    $scope.filterChanged = function () {
        textFilteredLogs = applyTextFilter(queryFilteredLogs);
        updateVisibleLogs(textFilteredLogs);

        if (textFilteredLogs.length < infiniteScrollSize) {
            populateMoreLogs(infiniteScrollSize);
        }
    };

    $scope.clearLog = function () {
        logData = [];
        queryFilteredLogs = [];
        textFilteredLogs = [];
        $scope.visibleLogs = [];
        $scope.filteredLogCount = 0;
        $scope.selectedLog = null;
    };

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
    
    $scope.formatMomentToDate = function (momentDate) {
        return momentDate.toDate();
    };

    // 
    // Get existing logs from the server.
    //
    var requestLogsFromServer = function (skip, limit) {
        assert.isNumber(skip);
        assert.isNumber(limit);

        return $http.get('logs?skip=' + skip + '&limit=' + limit)
            .then(function (results) {
                assert.isArray(results.data);

                return results.data;
            })
            .then(function (incomingLogs) {
                
                return Enumerable.from(incomingLogs)
                    .select(formatLog)
                    .toArray();                    
            });
    };

    //
    // Populate more logs into the client list as it is scrolled.
    //
    var populateMoreLogs = function (limit) {
        return requestLogsFromServer($scope.receivedLogCount, limit)
            .then(function (incomingLogs) {
                if (incomingLogs.length === 0) {
                    // No more logs to get.
                    return;
                }

                // Got a bunch of logs.
                $scope.receivedLogCount += incomingLogs.length;
                
                var numAddedAfterFilter = addMoreLogs(incomingLogs);
                if (numAddedAfterFilter < limit) {
                    // Logs were filtered out so we haven't reached our limit yet.
                    // Recurse and get more logs.
                    return populateMoreLogs(limit - numAddedAfterFilter)
                        .then(function (numLogsAdded) {
                            return numAddedAfterFilter + numLogsAdded;
                        });
                }

                return numAddedAfterFilter;
            });
    };

    //
    // Infinite scroll function
    //
    $scope.requestMoreLogs = function (deferredObj) {

        populateMoreLogs(infiniteScrollSize)
            .then(function (numLogsAdded) {
                console.log('Added ' + numLogsAdded + " logs to the visible list.");

                if (deferredObj) {
                    deferredObj.resolve();
                }
            })
            .catch(function(err) {
                $log.error(err);
                deferredObj.reject(err);
            });
    };
    
    //
    // Add logs to the bottom.
    //
    var addMoreLogs = function (logs) {
        assert.isArray(logs);

        logData = logData.concat(logs);
        var queryFiltered = applyQueryFilter(logs);
        queryFilteredLogs = queryFilteredLogs.concat(queryFiltered); // Only filter incoming logs.
        var textFiltered = applyTextFilter(queryFiltered);
        textFilteredLogs = textFilteredLogs.concat(textFiltered); // Only filter incoming logs.
        updateVisibleLogs(textFilteredLogs);

        return textFilteredLogs.length; // Number of logs actually added to the visible list.
    };
    
    //
    // Add logs to the top.
    //
    var addLogsToTop = function (logs) {
        assert.isArray(logs);

        logData = logs.concat(logData);
        var queryFiltered = applyQueryFilter(logs);  // Only filter incoming logs.
        queryFilteredLogs = queryFiltered.concat(queryFilteredLogs);
        var textFiltered = applyTextFilter(queryFiltered);
        textFilteredLogs = textFiltered.concat(textFilteredLogs); // Only filter incoming logs.

        updateVisibleLogs(textFilteredLogs);

        return textFilteredLogs.length; // Number of logs actually added to the visible list.
    };
});
