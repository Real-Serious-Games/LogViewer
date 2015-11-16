'use strict';

var conf = require('confucious');

var startServer = function (inputPlugin) {
    
    if (!inputPlugin) {
        throw new Error("'inputPlugin' argument not specified.");
    }
    
    var express = require('express');
    var app = express();
    var socketio = require('socket.io');
    var bodyParser = require('body-parser');
    var path = require('path');
    var clientManager = new require('./clientManager.js')();
    
    ///
    ///Set up configuration, allowing the command line to override the config file if necessary
    ///
    
    //load configuration file path
    var configPath = conf.get("config") || './config.js';
    
    var config = require(configPath);
    
    var port = conf.get("port") || config.port;
    
    //by default the secret is not used
    var secret = "";
    
    if (conf.get("use-secret")) {
        secret = conf.get("secret") || config.secret;
    }
    
    ///
    ///Completed configuration set up
    ///
    
    app.use(bodyParser.json());
    
    app.use(
        '/' + secret,
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
    app.get('/' + secret + '/logs', function(req, res) {
    
        console.log("Retreiving existing logs for client...");
    
        inputPlugin
            .connect()
            .then(function(logs) {            
                console.log("Found " + logs.length + " existing logs.");
    
                res.json(logs.reverse());
            });
    });
    
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
    
    var inputPlugin = './mongodb-input';
    
    if (argv.inputplugin) {
        inputPlugin = argv.inputplugin;
    }
    
    ///
    ///Push command line configuration variables to confucious if they exist
    ///
    
    if (argv.usesecret) {
        conf.set("use-secret", true);
    }
    
    if (argv.config) {
        conf.set("config", argv.config);
    }
    
    if (argv.port) {
        conf.set("port", argv.port);
    }
    
    if (argv.secret) {
        conf.set("secret", argv.secret);
    }
    
    //
    //Run from command line
    //
    startServer(require(inputPlugin)({}));
}
else {
    //
    //Required from another module
    //
    module.exports = startServer;
}
