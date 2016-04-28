var assert = require('assert'),
    InitialiseMsg = require('../../../PlugwiseTxMessages/Initialise');

describe('PlugwiseTxMessage - Initialise', function() {
    it('should store a message type of 0', function() {
        var msg = new InitialiseMsg();

        assert.deepEqual(0, msg.type);
    });

    it('should set a message of 000A', function() {
        var msg = new InitialiseMsg();

        assert.equal("\x05\x05\x03\x03000AB43C\x0D\x0A", msg.message);
    });

    it('should return the address object back through the callback', function() {
        assert(false);
    });
});