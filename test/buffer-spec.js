var assert = require('assert'),
    sinon = require('sinon'),
    Buffer = require('../buffer.js');

describe('Buffer', function() {
    it('should return an array of messages when emmiting a messages event', function(next) {
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
        buffer.store("first message\nsecond message\npartial mes...");
    });

    it('should have stored any incomplete messages from previously processing', function(next) {
        var buffer = new Buffer();
        var count = 0;
        buffer.on('messages', function(data) {
            if (count === 0) {
                assert.equal(data.length, 2);
                assert.equal(data[0], 'first message');
                assert.equal(data[1], 'second message');
                count++;    
                return;
            }
            assert.equal(data.length, 2);
            assert.equal(data[0], 'partial message');
            assert.equal(data[1], 'another message');
            next();
        });
        buffer.store("first message\nsecond message\npartial mes");
        buffer.store("sage\nanother message\n");
    });

    it('should support custom footers', function(next) {
        var buffer = new Buffer(),
            count = 0;
            
        buffer.setPatternEnd('~');
        buffer.on('messages', function(data) {
            if (count === 0) {
                assert.equal(data.length, 2);
                assert.equal(data[0], 'first message');
                assert.equal(data[1], 'second message');
                count++;    
                return;
            }
            assert.equal(data.length, 2);
            assert.equal(data[0], 'partial message');
            assert.equal(data[1], 'another message');
            next();
        });
        buffer.store("first message~second message~partial mes");
        buffer.store("sage~another message~");
    });

    it('should support custom footer patterns', function(next) {
        var buffer = new Buffer(),
            count = 0;
            
        buffer.setPatternEnd('(?:~|,)');
        buffer.on('messages', function(data) {
            if (count === 0) {
                assert.equal(data.length, 2);
                assert.equal(data[0], 'first message');
                assert.equal(data[1], 'second message');
                count++;    
                return;
            }
            assert.equal(data.length, 2);
            assert.equal(data[0], 'partial message');
            assert.equal(data[1], 'another message');
            next();
        });
        buffer.store("first message~second message,partial mes");
        buffer.store("sage~another message~");
    });

    it('should support custom headers', function(next) {
        var buffer = new Buffer(),
            count = 0;
            
        buffer.addPatternStart('~');
        buffer.on('messages', function(data) {
            if (count === 0) {
                assert.equal(data.length, 2);
                assert.equal(data[0], 'first message');
                assert.equal(data[1], 'second message');
                count++;    
                return;
            }
            assert.equal(data.length, 1);
            assert.equal(data[0], 'partial message');
            next();
        });
        buffer.store("random data~first message\n~second message\n~partial mes");
        buffer.store("sage\n");
    });
});