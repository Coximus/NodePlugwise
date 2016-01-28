var assert = require('assert'),
    sinon = require('sinon'),
    Plugwise = require('../index.js'),
    Serialport = require('serialport'),
    Buffer = require('../buffer');

describe('Plugwise', function() {

    afterEach(function() {
        if (Serialport.list.restore) {
            Serialport.list.restore();
        }
    });

    describe('Initialise', function() {
        it('should create a buffer instance', function() {
            var plugwise = new Plugwise();
            assert(plugwise.buffer instanceof Buffer);
        });
    });

    describe('List ports', function() {
        it('should call serialport.list', function(done) {
            var spy = sinon.spy(Serialport, 'list');
            new Plugwise().getSerialPorts(function() {
                assert.equal(1, spy.callCount);
                Serialport.list.restore();
                done();
            });
        });

        it('should return an empty array if serialport.list returns an error', function(done) {
            sinon.stub(Serialport, 'list').yields('some error', null);
            new Plugwise().getSerialPorts(function(ports) {
                assert.equal(true, Array.isArray(ports));
                assert.equal(0, ports.length);
                Serialport.list.restore();
                done();
            });
        });

        it('should return an empty array if serialport.list does not return an array ', function(done) {
            sinon.stub(Serialport, 'list').yields(null, 'string data');
            new Plugwise().getSerialPorts(function(ports) {
                assert.equal(true, Array.isArray(ports));
                assert.equal(0, ports.length);
                Serialport.list.restore();
                done();
            });
        });

        it('should return only serial ports manufactured by FTDI', function() {
            var dataprovider = [
                {
                    input: [{}],
                    expected: []
                }, {
                    input: [{ manufacturer: 'FTDI' }],
                    expected: [{ manufacturer: 'FTDI' }]
                }, {
                    input: [{ manufacturer: 'FTDI' },{ manufacturer: 'not-FTDI' }],
                    expected: [{ manufacturer: 'FTDI' }]
                }
            ];
            dataprovider.forEach(function(test) {
                sinon.stub(Serialport, 'list').yields(null, test.input);
                new Plugwise().getSerialPorts(function(ports) {
                    assert.equal(ports.length, test.expected.length);
                });
                Serialport.list.restore();
            });
        });
    });

    describe('Open serial port', function() {

        it('should call create new serial port connection using the correct serial parameters', function() {
            var mock = sinon.mock(Serialport),
                plugwise = new Plugwise();

            mock.expects('SerialPort').once().withArgs('some-port', {baudrate: 115200});
            plugwise.connect('some-port', function(){});
            mock.verify();
            mock.restore();
        });
        
        it('should return an error if opening a connection to the serial port fails', function() {
            sinon.stub(Serialport, 'SerialPort').yields('some error');
            var spy = sinon.spy();
            var plugwise = new Plugwise();
            plugwise.connect('port-name', spy);
            assert.equal(spy.firstCall.args[0], 'some error');
            assert(!plugwise.connected);
            Serialport.SerialPort.restore();
        });

        it('should have a property connected to still be false if there was an error', function() {
            sinon.stub(Serialport, 'SerialPort').yields('some error');
            var plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            assert(!plugwise.connected);
            Serialport.SerialPort.restore();
        });

        it('should store the returned value if there was no error connecting', function() {
            sinon.stub(Serialport, 'SerialPort').yields().returns({some: 'object'});
            var spy = sinon.spy();
            var plugwise = new Plugwise();
            plugwise.connect('port-name', spy);
            assert.equal(spy.firstCall.args[1], 'Connected');
            assert(plugwise.serialPort !== undefined);
            assert(plugwise.serialPort.some === 'object');
            Serialport.SerialPort.restore();
        });

        it('should set its connected property to true if there was no error', function() {
            sinon.stub(Serialport, 'SerialPort').yields().returns({some: 'object'});
            var plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            assert(plugwise.connected);
            Serialport.SerialPort.restore();
        });
    });

    describe('Receive messages', function() {
        var util = require("util"),
            EventEmitter = require("events").EventEmitter,
            MockBuffer = function() {};

        util.inherits(MockBuffer, EventEmitter);

        it('should log the message to the console', function() {
            var spy = sinon.spy(console, 'log'),
                mockBuffer = new MockBuffer(),
                plugwise;

            sinon.stub(Buffer, 'getInstance', function() {return (mockBuffer)});
            sinon.stub(Serialport, 'SerialPort').yields().returns({some: 'object'});
            
            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            mockBuffer.emit('BUFFER-RECV-messages', 'hello'); 
            
            assert.equal(spy.firstCall.args[0], 'message received');
            
            Serialport.SerialPort.restore();
            Buffer.getInstance.restore();
        });
    });
});