'use strict';

module.exports = function () {

	var clients = [];

	return {

		///
		/// Add a new client to the list
		///
		addClient: function (client) {
			
			//check that the client isn't already on the list
			var i = clients.indexOf(client);
			if(i === -1) {
				clients.push(client);
			}
		},

		///
		/// Remove a specific client from the client list if they exist
		///
		removeClient: function (client) {
			var i = clients.indexOf(client);
			if (i !== -1) {
				clients.splice(i, 1);
			}
		},

		///
		/// Get the list of clients
		///
		getClients: function () {
			return clients;
		},
	}
};