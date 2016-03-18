var assert = require('assert'),
    sinon = require('sinon'),
    BufferProcessor = require('../bufferProcessor.js'),
    PlugwiseMessage = require('../PlugwiseMessageModel');

describe('Buffer Processor', function() {
    describe('The input is valid', function() {
        it('should return a plugwise message model if the data input is valid', function() {
            var bufferInput = "\x30\x30\x30\x30\x30\x30\x30\x39\x30\x30\x43\x31\x46\x43\x43\x30",
                result = BufferProcessor(bufferInput);
    
            assert(typeof result === 'object');
        });
    });

    describe('The input is invalid', function() {
        it('should return null if the data input is less than 12 characters long', function() {
            var bufferInput = "1234",
                result = BufferProcessor(bufferInput);

            assert(!result);
        });

        it('should return null if the data input fails the CRC check', function() {
            var bufferInput = "\x30\x30\x30\x30\x30\x30\x30\x39\x30\x30\x43\x31\x46\x43\x43\x31",
                result = BufferProcessor(bufferInput);

            assert(!result);
        });
    });

});