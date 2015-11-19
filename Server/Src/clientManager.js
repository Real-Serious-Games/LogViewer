'use strict'

module.exports = function () {
	var self = this;
	
	var clients = [];
	
	///
	/// Add a new client to the list
	///
	self.addClient = function (client) {
		//check that the client isn't already on the list
		var i = clients.indexOf(client);
		if (i === -1) {
			clients.push(client);
		}
	};


	///
	/// Remove a client from teh client list if they exist
	///
	self.removeClient = function (client) {
		var i = clients.indexOf(client);
		if (i === -1) {
			clients.splice(i, 1);
		}
	};

	///
	/// Get the list of clients
	///
	self.getClients = function () {
		return clients;
	};
};