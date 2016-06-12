var assert = require('assert'),
    SwitchPowerStateMsg = require('../../../PlugwiseTxMessages/SwitchPowerState'),
    PlugwiseMessage = require('../../../PlugwiseMessageModel'),
    Promise = require('bluebird');

describe('PlugwiseTxMessage - SwitchPowerState', function() {
    describe('Processing parameters', function() {
        it('should call the callback with an error if no plug address is passed', function(done) {
            var msg = new SwitchPowerStateMsg(null, null, function(err, response) {
                assert.equal("Invalid plug address specified", err);
                done();
            });

        });

        it('should call the callback with an error if plug address length is not 16', function(done) {
            var msg = new SwitchPowerStateMsg("0123456789ABCDEFF", null, function(err, response) {
                assert.equal("Invalid plug address specified", err);
                done();
            });

        });

        it('should call the callback with an error if the desired state is not passed', function(done) {
            var msg = new SwitchPowerStateMsg("0123456789ABCDEF", null, function(err, response) {
                assert.equal("Invalid desired state", err);
                done();
            });
        });

        it('should call the callback with an error if the desired state is not 0 or 1', function(done) {
            var invalidTestStates = ["0", "1", "", 2, -1, "something"];
                promises = [];

            invalidTestStates.forEach(function(testState) {
                promises.push(new Promise(function(resolve, reject) {
                    var msg = new SwitchPowerStateMsg("0123456789ABCDEF", testState, function(err, response) {
                        console.log('got here');
                        resolve(err);
                    });
                }));
            });

            Promise.all(promises).then(function(errors){
                var i = 0; 

                for(i = 0; i < invalidTestStates.length; i++) {
                    assert.equal(errors[i], "Invalid desired state")
                }
                done();
            }).catch(function(e) {
                done(e);
            });
        });
    });

    describe('Message Creatiion', function() {
        it('should store a message type of 1', function() {
            var msg = new SwitchPowerStateMsg("0123456789ABCDEF", 0);

            assert.deepEqual(1, msg.type);
        });

        it('should create the correct message for switching a plug on', function() {
            var msg = new SwitchPowerStateMsg("0123456789ABCDEF", 0);

            assert.deepEqual("\x05\x05\x03\x0300170123456789ABCDEF00601B\x0D\x0A", msg.message);
        });

        it('should create the correct message for switching a plug on', function() {
            var msg = new SwitchPowerStateMsg("0123456789ABCDEF", 1);

            assert.deepEqual("\x05\x05\x03\x0300170123456789ABCDEF01703A\x0D\x0A", msg.message);
        });
    });
});