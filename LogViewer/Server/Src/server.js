var express = require('express');
var app = express();
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var pmongo = require('promised-mongo');
var path = require('path');
var clientManager = require('./ConnectionManager.js');
var config = require('./config.js');

var database;

app.use(bodyParser.json());

app.use(
    '/',
    express.static(path.join(__dirname, '../../Client'))
);

var server = app.listen(config.config.port);
var io = socketio.listen(server);
var data;

///
/// When the socket receives a connection
///
io.sockets.on('connection', function (client) {
    //add client to client manager
    clientManager.addClient(client);
    
    //connect the client to the errors database.
    console.log('Connecting client to database collection: ' + config.config.errorsCollectionName + ' from database: ' + config.config.database + ' on host: ' + config.config.host);
    db = pmongo(config.config.host + '/' + config.config.database);
    var collection = db.collection(config.config.errorsCollectionName);
    var cursor = collection.find({}, {}, { tailable: true, timeout: false });
    //cursor.on('data', function (doc) {
    //    console.log('received data from error log, pushing to client');
    //    client.emit('update', doc);
    //});
    var logCollection = db.collection(config.config.logCollectionName);
    var logCursor = logCollection.find({}, {}, { tailable: true, timeout: false });
    console.log('Connecting client to database collection: ' + config.config.logCollectionName + ' from database: ' + config.config.database + ' on host: ' + config.config.host);
    logCursor.on('data', function (doc) {
        console.log('received data from log, pushing to client: ' + doc.RenderedMessage.toString());
        client.emit('update', doc);
    });
        
    ///
    /// Disconnect
    ///
    client.on('disconnect', function () {
        //remove client from client manager
        clientManager.removeClient(client);
    });
});
