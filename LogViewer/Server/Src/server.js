var express = require('express');
var app = express();
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var pmongo = require('promised-mongo');
var path = require('path');

var database;

app.use(bodyParser.json());

app.use(
    '/',
    express.static(path.join(__dirname, '../../Client'))
);

var server = app.listen(process.env.PORT || 3412);
var io = socketio.listen(server);

var data;

var clients = [];

var host = "dbtest-PC";
var database = "logs";
var collectionName = "unity.build.errors";

///
/// When the socket receives a connection
///
io.sockets.on('connection', function (client) {
    //add client to client array
    addClient(client);
    
    //connect the client to the errors database.
    console.log('Connecting client to database collection: ' + collectionName + ' from database: ' + database + ' on host: ' + host);
    db = pmongo(host + '/' + database);
    var collection = db.collection(collectionName);
    var cursor = collection.find({}, {}, { tailable: true, timeout: false });
    cursor.on('data', function (doc) {
        console.log('New data in the database, sending to client');
        client.emit('update', doc);
    });
        
    ///
    /// Disconnect
    ///
    client.on('disconnect', function () {
        removeClient(client);
    });
});

///
/// Add a new client to the array of clients
///
var addClient = function (client) {
    console.log('New client added: ' + client.toString());
    clients.push(client);
};

///
/// Remove a client from the array of clients
///
var removeClient = function (client) {
    console.log('Attempting to remove client: ' + client.toString());
    var i = clients.indexOf(client);
    if (i != -1) {
        console.log('Client was found in the list of clients');
        clients.splice(i, 1);
    }
};