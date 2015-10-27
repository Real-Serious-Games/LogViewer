'use strict';

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
    var config = require('./config.js');
    
    app.use(bodyParser.json());
    
    app.use(
        '/' + config.secret,
        express.static(path.join(__dirname, '../../Client'))
    );
    
    console.log('Booting server...');
    
    //St up the server, hook up to the database and preload the data that is currently in there
    var server = app.listen(process.env.PORT || config.port, function() {
    
        console.log('Establishing connection with the database...');
        //set up tailable cursors for each
    
        inputPlugin.on( function (doc) {
            clientManager.getClients()
                .forEach(function(client) {
                    client.emit('update', doc);
                });
        });
        
        
    });
    
    //client call for data
    app.get('/' + config.secret + '/logs', function(req, res) {
    
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
    
    //
    //Run from command line
    //
    startServer(require('./mongodb-input')({}));
}
else {
    //
    //Required from another module
    //
    module.exports = startServer;
}
