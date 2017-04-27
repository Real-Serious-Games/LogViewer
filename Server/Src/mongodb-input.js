'use strict'

//
//Input plugin that pulls logs from a MongoDB database
//

module.exports = function (conf) {
    var assert = require('chai').assert;
    
    ///Error handling
    if (!conf.get('host')) {
        throw new Error("'host' not specified in config.json or as a command line argument");
    }
    
    if (!conf.get('database')) {
        throw new Error("'database' not specified in config.json or as a command line argument");
    }
    
    if (!conf.get('logCollection')) {
        throw new Error("'logCollection' not specified in config.json or as a command line argument");
    }
    
    
    var pmongo = require('promised-mongo');
    var databaseConnectionString = conf.get("host") + '/' + conf.get("database");
    var databaseCollection = conf.get("logCollection");
    console.log('Log viewering connecting to database: ' + databaseConnectionString + ", collecton: " + databaseCollection);
    var db = pmongo(databaseConnectionString);
    var logsCollection = db.collection(databaseCollection);
    
    //the function that is called when new logs arrive from the database
    var newLogCallback;

    logsCollection.count()
        .then(function (existingCount) {

            console.log('Querying the logs collection...');

            var logsCursor = logsCollection.find({}, {}, { tailable: true, timeout: false });

            logsCursor.on('data', function(doc) {        
                if (existingCount > 0) {
                    // Skip logs already in the database.
                    // It would be nice to use the 'skip' function for this, but it doesn't appear to work for capped collections.
                    --existingCount; 
                    return;
                }

                if (newLogCallback) {
                    newLogCallback(doc);
                }
            });
        })
        .catch(function (err) {
            console.error('Error getting log count.');
            console.error(err && err.stack || err);
        })
        ;

    return {
        //callback is a function expects the new entry
        on: function (callback) {
            newLogCallback = callback;
        },
        
        //returns a promise that resolves once the initial logs are received.
        request: function (skip, limit) {
            assert.isNumber(skip);
            assert.isNumber(limit);
            
            console.log('limit: ' + limit + ' skip: ' + skip);
            return logsCollection.find()
                .sort({ _id: -1 })
                .limit(limit)
                .skip(skip)
                .toArray();
        }
    }
}