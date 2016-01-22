var assert = require('assert'),
    sinon = require('sinon'),
    Buffer = require('../buffer.js');

describe('Buffer', function() {
    it('should return an array on messages when emmiting a messages event', function(next) {
        var buffer = new Buffer();
        buffer.on('messages', function(data) {
            assert(Array.isArray(data));
            next();
        });
        buffer.store("data");
    });

    it('should default to using a new line character to delimit messages in the buffer', function(next) {
        var buffer = new Buffer();
        buffer.on('messages', function(data) {
            assert.equal(data[0], 'first message');
            assert.equal(data[1], 'second message');
            next();
        });
        buffer.store("first message\nsecond message\n");
    });

    it('should not return an empty message if the input ends in the delimiter', function(next) {
        var buffer = new Buffer();
        buffer.on('messages', function(data) {
            assert.equal(data.length, 2);
            next();
        });
        buffer.store("first message\nsecond message\n");
    });

    it('should not return the last message if it did not end with the delimieter', function(next) {
        var buffer = new Buffer();
        buffer.on('messages', function(data) {
            assert.equal(data.length, 2);
            next();
        });
        buffer.store("first message7second message7partial mes...");
    });
});