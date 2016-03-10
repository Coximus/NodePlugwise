var assert = require('assert'),
    sinon = require('sinon'),
    BufferProcessor = require('../bufferProcessor.js');

describe('Buffer Processor', function() {
    it('should return null if the data input is not valid', function() {
        var bufferInput = "Invalid Buffer Data",
            result = BufferProcessor(bufferInput);

        assert(!result);
    });

    it('should return a plugwise message model if the data input is valid', function() {
        assert(false);
    });
});