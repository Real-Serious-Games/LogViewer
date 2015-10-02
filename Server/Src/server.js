var express = require('express');
var app = express();
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var pmongo = require('promised-mongo');
var path = require('path');
var clientManager = require('./ConnectionManager.js');
var config = require('./config.js');

var db = pmongo(config.host + '/' + config.database);
var logsCollection = db.collection(config.logCollectionName);

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


    logsCollection.find().toArray().then(function() { 
        console.log('Database connection established.');
    });

    var logsCursor = logsCollection.find({}, {}, { tailable: true, timeout: false });

    logsCursor.on('data', function(doc) {        
        clientManager.clients
            .forEach(function(client) {
                client.emit('update', doc);
            });
    });
});

//client call for data
app.get('/' + config.secret + '/logs', function(req, res) {

    console.log("Retreiving existing logs for client...");

    logsCollection
        .find()
        .toArray()
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
