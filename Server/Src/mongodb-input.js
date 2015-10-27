'use strict'

//
//Input plugin that pulls logs from a MongoDB database
//

module.exports = function () {
    var config = require('./config.js');
	var pmongo = require('promised-mongo');
	var db = pmongo(config.host + '/' + config.database);
	var logsCollection = db.collection(config.logCollectionName);
    
    //the function that is called when new logs arrive from the database
    var newLogCallback;
	
	logsCollection.find().toArray().then(function() { 
        console.log('Database connection established.');
    });

    var logsCursor = logsCollection.find({}, {}, { tailable: true, timeout: false });

    logsCursor.on('data', function(doc) {        
        if (newLogCallback) {
            newLogCallback(doc);
        }
    });

	return {
        //callback is a function expects the new entry
		on: function (callback) {
            newLogCallback = callback;
        },
        
        //returns a promise that resolves once the initial logs are received.
        connect: function () {
            return logsCollection.find().toArray();
        }
	}
}