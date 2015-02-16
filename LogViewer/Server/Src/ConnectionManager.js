this.clients = [];
    
///
/// Add a client to the list of connected clients
///
exports.addClient = function (client) {
    console.log('New client added: ' + client.toString());
    this.clients.push(client);
};
    
///
/// Remove a client from the list of connected clients
///
exports.removeClient = function (client) {
    console.log('Attempting to remove client: ' + client.toString());
    var i = this.clients.indexOf(client);
    if (i != -1) {
        console.log('Client was found in the list of clients');
        this.clients.splice(i, 1);
    }
};