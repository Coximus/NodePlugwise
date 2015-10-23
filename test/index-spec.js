var assert = require('assert'),
    plugwise = require('../index.js');

describe('something', function() {
    it('should run a test', function(done) {
        var test = plugwise.getSerialPorts();
        console.log(test);
        assert.equal(true, false);
    });
});