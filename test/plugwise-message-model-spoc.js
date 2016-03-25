var assert = require('assert'),
	PlugwiseMessageModel = require('../PlugwiseMessageModel');

describe('Plugwise Message Model', function() {
	describe('isAck', function() {
		it('should return true if code and parameters signify it is an ACK', function() {
			var message = new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00C1"});

			assert(message.isAck());
		});

		it('should return false if code and parameters signify it is an ACK', function() {
			var messages = [
				{code: "0000", sequenceNo: "0001", parameters: "00E1"},
				{code: "0001", sequenceNo: "0001", parameters: "00C1"}
			];

			messages.forEach(function(message) {
				var msg = new PlugwiseMessageModel(message);
				assert.equal(false, msg.isAck());
			});
		});
	});
});