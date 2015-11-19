'use strict'

//
//Input plugin that pulls logs from a MongoDB database
//

module.exports = function (conf) {
    
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
	var db = pmongo(conf.get("host") + '/' + conf.get("database"));
	var logsCollection = db.collection(conf.get("logCollection"));
    
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