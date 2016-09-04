var assert = require('assert'),
    sinon = require('sinon'),
    Plugwise = require('../../Plugwise.js'),
    Serialport = require('serialport'),
    Buffer = require('../../buffer'),
    util = require("util"),
    EventEmitter = require("events").EventEmitter,
    transmissionMessages =require('../../PlugwiseTxMessages/TransmissionMessages'),
    PlugwiseAckMessageStringHelper = require('../helpers/generate-plugwise-ack-string'),
    PlugwiseNAckMessageStringHelper = require('../helpers/generate-plugwise-nack-string'),
    PlugwiseMessageStringHelper = require('../helpers/generate-plugwise-message-string');

describe('Plugwise - Switch Plug', function() {

    stubSerialPort = function() {
        var writeSpy = sinon.spy(),
            MockSerialPort = function () {
                this.some = 'object';
                this.write = sinon.spy();
            };

        util.inherits(MockSerialPort, EventEmitter);
        var mockSerialPort = new MockSerialPort();
        sinon.stub(Serialport, 'SerialPort').yields().returns(mockSerialPort);
    };

    beforeEach(function() {
        stubSerialPort();
    });

    afterEach(function() {
        if (Serialport.SerialPort.restore) {
            Serialport.SerialPort.restore();
        }
        if (Buffer.getInstance.restore) {
            Buffer.getInstance.restore();
        }
    });

    describe('Errors', function() {

        it('should not send a message to the serial port if the plug address is malformed', function(done) {
            var plugwise,
                plugAddress = "invalid",
                message = new transmissionMessages.SwitchPower(plugAddress, 0, function(error){
                    assert(error);
                    done();
                });
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.switchPlug(plugAddress, 0, function(){});

            assert.equal(0, plugwise.serialPort.write.callCount);
        });

        it('should send the correct message to the serial port', function() {
            var plugwise,
                plugAddress = "0123456789ABCDEF",
                message = new transmissionMessages.SwitchPower(plugAddress, 0, null);
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.switchPlug(plugAddress, 0, null);

            assert.equal(1, plugwise.serialPort.write.callCount);
            assert.equal(
                message.message,
                plugwise.serialPort.write.firstCall.args[0]
            );
        });

        it('should call the callback with an error if the plug did not response', function(done) {
            var plugwise,
                buffer = new Buffer(),
                plugAddress = "0123456789ABCDEF",
                message = new transmissionMessages.SwitchPower(plugAddress, 0, null);
            
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.switchPlug(plugAddress, 0, function(error, response) {
                assert.equal('The plug ' + plugAddress + ' is not responding', error);
                done();
            });

            buffer.store(PlugwiseAckMessageStringHelper());
            buffer.store(PlugwiseNAckMessageStringHelper());
        });

        it('should call the callback with an error if the plug did not response', function(done) {
            var plugwise,
                buffer = new Buffer(),
                plugAddress = "0123456789ABCDEF",
                message = new transmissionMessages.SwitchPower(plugAddress, 0, null);
            
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.switchPlug(plugAddress, 0, function(error, response) {
                assert.equal('The plug ' + plugAddress + ' is not responding', error);
                done();
            });

            buffer.store(PlugwiseAckMessageStringHelper());
            buffer.store(PlugwiseNAckMessageStringHelper());
        });

        it('should call the callback with an error if there was a generic error message', function(done) {
            var plugwise,
                buffer = new Buffer(),
                plugAddress = "0123456789ABCDEF",
                message = new transmissionMessages.SwitchPower(plugAddress, 0, null);
            
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.switchPlug(plugAddress, 0, function(error, response) {
                assert.equal('There was an error communicating with plug ' + plugAddress, error);
                done();
            });

            buffer.store(PlugwiseAckMessageStringHelper());
            buffer.store(PlugwiseMessageStringHelper({code: '1234', sequenceNumber: '0001'}));
        });
    });

    describe('Success', function() {
        it('should call the callback with no error and an object with the plug address and state', function(done) {
            var plugwise,
                buffer = new Buffer(),
                plugAddress = "0123456789ABCDEF",
                message = new transmissionMessages.SwitchPower(plugAddress, 0, null);
            
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.switchPlug(plugAddress, 0, function(error, response) {
                assert.deepEqual(null, error);
                assert.equal(plugAddress, response.plugAddress);
                assert.equal(0, response.state);
                done();
            });

            buffer.store(PlugwiseAckMessageStringHelper());
            buffer.store(PlugwiseMessageStringHelper({code: '0000', sequenceNumber: '0001', parameters: '00D8' + plugAddress}));
        });
    });
});
