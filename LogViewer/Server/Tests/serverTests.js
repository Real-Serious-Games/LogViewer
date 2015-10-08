var assert = require('chai').assert;
var should = require('chai').should();

var connectionManager = require('../Src/clientManager');

describe ('Array', function () {
	describe ('#indexOf()', function () {
		it('should return -1 when the value is not present', function () {
			assert.equal(-1, [1,2,3].indexOf(5));
			assert.equal(-1, [1,2,3].indexOf(0));
		});
		it('should return index when the value is present', function () {
			assert.equal(0, [1,2,3].indexOf(1));
		});
	});
});

describe ('clientManager', function () {
	
	describe ('#getClients()', function () {
		it('should return nothing when there are no clients', function () {
			var testObejct = new connectionManager();
			var clients = testObejct.getClients();
			clients.should.have.length(0);
		});

		it('should return any clients', function () {
			var testObject = new connectionManager();
			var testName = "TestClient";

			var client = { Name: testName };
			testObject.addClient(client);

			var clients = testObject.getClients();
			clients.should.have.length(1);
			clients[0].Name.should.equal(testName);
		});
	});

	describe ('#addClient()', function () {
		it('should add the passed client when called', function () {
			var testObject = new connectionManager();
			var testName = "TestClient";
			var client = { Name: testName };

			testObject.addClient(client);

			var clients = testObject.getClients();
			clients.should.have.length(1);
			clients[0].Name.should.equal(testName);
		})
	})
})