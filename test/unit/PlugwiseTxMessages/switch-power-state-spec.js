var assert = require('assert'),
    SwitchPowerStateMsg = require('../../../PlugwiseTxMessages/SwitchPowerState'),
    PlugwiseMessage = require('../../../PlugwiseMessageModel'),
    Promise = require('bluebird');

describe('PlugwiseTxMessage - SwitchPowerState', function() {

    var plugAddress = '0123456789ABCDEF';

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
            var msg = new SwitchPowerStateMsg(plugAddress, null, function(err, response) {
                assert.equal("Invalid desired state", err);
                done();
            });
        });

        it('should call the callback with an error if the desired state is not 0 or 1', function(done) {
            var invalidTestStates = ["0", "1", "", 2, -1, "something"];
                promises = [];

            invalidTestStates.forEach(function(testState) {
                promises.push(new Promise(function(resolve, reject) {
                    var msg = new SwitchPowerStateMsg(plugAddress, testState, function(err, response) {
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
            var msg = new SwitchPowerStateMsg(plugAddress, 0);

            assert.deepEqual(1, msg.type);
        });

        it('should create the correct message for switching a plug on', function() {
            var msg = new SwitchPowerStateMsg(plugAddress, 0);

            assert.deepEqual("\x05\x05\x03\x030017" + plugAddress + "00601B\x0D\x0A", msg.message);
        });

        it('should create the correct message for switching a plug on', function() {
            var msg = new SwitchPowerStateMsg(plugAddress, 1);

            assert.deepEqual("\x05\x05\x03\x030017" + plugAddress + "01703A\x0D\x0A", msg.message);
        });
    });

    describe('errors', function() {

        var gernerateMsgWithGenericError = function(callback) {
            return new SwitchPowerStateMsg(plugAddress, 0, function(error, response) {
                assert.equal('There was an error communicating with plug ' + plugAddress, error);
                callback();
            });
        };

        it('should call the callback with a suitable error if there was an error', function(done) {
            var msg = gernerateMsgWithGenericError(done);
            msg.callback('NAK Received', null);
        });
        
        it('should call the callback with a suitable error if no receptions occured for this event', function(done) {
            var msg = gernerateMsgWithGenericError(done);
            msg.callback(null, null);
        });
        
        it('should call the callback with a suitable error if more than 1 reception occured for this event', function(done) {
            var msg = gernerateMsgWithGenericError(done);
            msg.callback(null, ["reception1", "reception2"]);
        });
        
        it('should call the callback with a suitable error if the first is not an Ack or a NAcK', function(done) {
            var invalidCode = '1234',
                receptions = [new PlugwiseMessage({code: invalidCode, parameters: 'some-parameters'})],
                msg = gernerateMsgWithGenericError(done);

            msg.callback(null, receptions);
        });

        it('should call the callback with a suitable error if the first message is a NAck', function(done) {
            var NAck = new PlugwiseMessage({code: '0000', parameters: '00E1'});
                receptions = [NAck],
                msg = new SwitchPowerStateMsg(plugAddress, 0, function(error, response) {
                    assert.equal('The plug ' + plugAddress + ' is not responding', error);
                    done();
                });

            msg.callback(null, receptions);
        });
    });

    describe('on success', function() {
        it('should call the callback with no error', function(done) {
            var Ack = new PlugwiseMessage({code: '0000', parameters: '00C1'}),
                receptions = [Ack],
                msg = new SwitchPowerStateMsg(plugAddress, 0, function(error, response) {
                    assert.deepEqual(null, error);
                    done();
                });

            msg.callback(null, receptions);
        });

        it('should call the callback with an object containing the plug address and new state', function(done) {
            var Ack = new PlugwiseMessage({code: '0000', parameters: '00C1'}),
                receptions = [Ack],
                desiredState = 0,
                desiredResponse = {plugAddress: plugAddress, state: desiredState},
                msg = new SwitchPowerStateMsg(plugAddress, 0, function(error, response) {
                    assert.deepEqual(desiredResponse, response);
                    done();
                });

            msg.callback(null, receptions);
        });
    });
});