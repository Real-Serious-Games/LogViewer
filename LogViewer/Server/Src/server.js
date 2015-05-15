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


var db;
var logsCollection;
var errorCollection;

var errorsCursor;
var logsCursor;


//St up the server, hook up to the database and preload the data that is currently in there
var server = app.listen(process.env.PORT || config.config.port, function() {

    console.log('establishing connection with the database');
    db = pmongo(config.config.host + '/' + config.config.database);
    logsCollection = db.collection(config.config.logCollectionName);
    errorCollection = db.collection(config.config.errorsCollectionName);
    //set up tailable cursors for each

    logsCursor = logsCollection.find({}, {}, { tailable: true, timeout: false });
    errorsCursor = errorCollection.find({}, {}, { tailable: true, timeout: false });

    logsCursor.on('data', function(doc) {
        clientManager.clients
            .forEach(function(client) {
                client.emit('update', doc);
            });
    });

    errorsCursor.on('data', function(doc) {
        clientManager.clients
            .forEach(function(client) {
                client.emit('update', doc);
            });
    });

    //populate starting data and notify any already connected clients
    logsCollection
        .find()
        .toArray()
        .then(function(docs) {
            data = docs;
            console.log('Log Collection retreived from database');
            errorCollection
            .find()
            .toArray()
            .then(function(errorDocs) {
                console.log('Error collection retreived from database');
                data = data.concat(errorDocs);
                clientManager.clients
                    .forEach(function(client) {
                        console.log('populating client');
                        client.emit('populate', data);
                    });
            });
        });


    //data = data.concat(errorCollection.find().toArray());
});

//client call for data
app.get('/update', function(req, res) {
    res.json(data);
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
