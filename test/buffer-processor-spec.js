var assert = require('assert'),
    sinon = require('sinon'),
    BufferProcessor = require('../bufferProcessor.js'),
    PlugwiseMessage = require('../PlugwiseMessageModel');

describe('Buffer Processor', function() {
    describe('The input is valid', function() {
        it('should return a plugwise message model if the data input is valid', function() {
            var bufferInput = "\x30\x30\x30\x30\x30\x30\x30\x39\x30\x30\x43\x31\x46\x43\x43\x30",
                result = BufferProcessor.process(bufferInput);
    
            assert(typeof result === 'object');
        });

        it('should set the correct message code', function() {
            var bufferInputs = [
                { 
                    "message": "\x30\x30\x30\x30\x30\x30\x30\x39\x30\x30\x43\x31\x46\x43\x43\x30",
                    "code": "0000"
                },
                { 
                    "message": "\x30\x31\x30\x31\x30\x30\x30\x39\x30\x30\x43\x31\x43\x46\x41\x41",
                    "code": "0101"
                }];

            bufferInputs.forEach(function(input) {
                assert.equal(input.code, BufferProcessor.process(input.message).code);
            });
        });

        it('should set the correct sequence number', function() {
            var bufferInputs = [
                {
                    "message": "\x30\x30\x30\x30\x30\x30\x30\x39\x30\x30\x43\x31\x46\x43\x43\x30",
                    "sequenceNo": "0009"
                },
                {
                    "message": "\x30\x30\x30\x30\x30\x30\x31\x30\x30\x30\x43\x31\x31\x31\x31\x43",
                    "sequenceNo": "0010"
                }
            ];

            bufferInputs.forEach(function(input) {
                assert.equal(input.sequenceNo, BufferProcessor.process(input.message).sequenceNo);
            });
        });

        it('should set the correc message parameters', function() {
           var bufferInputs = [
                {
                    "message": "\x30\x30\x30\x30\x30\x30\x30\x39\x37\x37\x39\x30",
                    "parameters": null
                },
                {
                    "message": "\x30\x30\x30\x30\x30\x30\x31\x30\x68\x65\x6C\x6C\x6F\x38\x46\x32\x43",
                    "parameters": "hello"
                }
            ];

            bufferInputs.forEach(function(input) {
                assert.equal(input.parameters, BufferProcessor.process(input.message).parameters);
            }); 
        });
    });

    describe('The input is invalid', function() {
        it('should return null if the data input is less than 12 characters long', function() {
            var bufferInput = "1234",
                result = BufferProcessor.process(bufferInput);

            assert(!result);
        });

        it('should return null if the data input fails the CRC check', function() {
            var bufferInput = "\x30\x30\x30\x30\x30\x30\x30\x39\x30\x30\x43\x31\x46\x43\x43\x31",
                result = BufferProcessor.process(bufferInput);

            assert(!result);
        });
    });

});