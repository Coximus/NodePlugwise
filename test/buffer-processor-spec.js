var assert = require('assert'),
    sinon = require('sinon'),
    BufferProcessor = require('../bufferProcessor.js');

describe('Buffer Processor', function() {
    it('should return null if the message is not valid', function() {
        var bufferInput = "Invalid Buffer Data",
            result = BufferProcessor(bufferInput);

        assert(!result);
    });
});