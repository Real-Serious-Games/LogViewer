'use strict';

var startServer = function (conf, inputPlugin) {
    
    if (!inputPlugin) {
        throw new Error("'inputPlugin' argument not specified.");
    }
    
    var express = require('express');
    var app = express();
    var socketio = require('socket.io');
    var bodyParser = require('body-parser');
    var path = require('path');
    var ClientManager = require('./clientManager.js'); 
    var clientManager = new ClientManager();
    
    ///
    ///Set up configuration, allowing the command line to override the config file if necessary
    ///
    
    var port = conf.get("port");
    
    //by default the secret is not used
    var secret = "";
    
    if (conf.get("secret")) {
        secret = conf.get("secret");
        secret = "/" + secret;
    }
    
    ///
    ///Completed configuration set up
    ///
    
    app.use(bodyParser.json());
    
    app.use(
        secret,
        express.static(path.join(__dirname, '../../Client'))
    );
    
    console.log('Booting server...');
    
    //St up the server, hook up to the database and preload the data that is currently in there
    var server = app.listen(process.env.PORT || port, function() {
    
        console.log('Establishing connection with the input plugin method...');
        //set up tailable cursors for each
    
        inputPlugin.on( function (doc) {
            clientManager.getClients()
                .forEach(function(client) {
                    client.emit('update', doc);
                });
        });
        
        
    });
    
    //client call for data
    app.get(secret + '/logs', function(req, res) {
        
        //set up defaults
        var skip = 0;
        var limit = 200;
        
        //override with params
        if (req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
        }
        
        console.log("Retreiving existing logs for client...");
    
        inputPlugin
            .request(skip, limit)
            .then(function(logs) {            
                console.log("Found " + logs.length + " existing logs.");
                res.json(logs);
            })
            .catch(function(err) {
               console.error(err && err.stack || err);
               res.status(500).end(); 
            });
    });
    
    app.get('/alive', function(req, res) {
        res.status(200).end();
    })
    
    var io = socketio.listen(server);
    var data = [];
    
    ///
    /// When the socket receives a connection
    ///
    io.sockets.on('connection', function (client) {
    
        //add client to client manager
        clientManager.addClient(client);
            
        ///
        /// Disconnect
        ///
        client.on('disconnect', function () {
            //remove client from client manager
            clientManager.removeClient(client);
        });
    });
};

if (require.main === module) {
    console.log('Starting from command line.');
    
    var argv = require('yargs').argv;
    var conf = require('confucious');
    var fs = require('fs');
    
    //set up the default path to the configuration file.
    var configFilePath = "config.json";
    
    //set up the default plugin to use.
    conf.set("inputplugin", './mongodb-input');
    
    //if a config file was provided on the command line, check that it exists and use it if it does
    if (argv.config) {
        if (fs.existsSync(argv.config)) {
            configFilePath = argv.config;
        }
    }
    
    //check that our file exists
    if (fs.existsSync(configFilePath)) {
        console.log('Loaded config file: ' + configFilePath);
        conf.pushJsonFile(configFilePath);
    } 
    
    conf.pushArgv();
    
    //
    //Run from command line
    //
    startServer(conf, require(conf.get("inputplugin"))(conf));
}
else {
    //
    //Required from another module
    //
    module.exports = startServer;
}
