var assert = require('assert'),
    sinon = require('sinon'),
    Plugwise = require('../index.js'),
    Serialport = require('serialport'),
    Buffer = require('../buffer'),
    BufferProcessor = require('../bufferProcessor'),
    util = require("util"),
    EventEmitter = require("events").EventEmitter;

describe('Plugwise', function() {

    stubListError = function() {
        sinon.stub(Serialport, 'list').yields('some error', null);
    };

    stubList = function() {
        sinon.stub(Serialport, 'list').yields(null, 'string data');
    };

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

    afterEach(function() {
        if (Serialport.list.restore) {
            Serialport.list.restore();
        }
        if (Serialport.SerialPort.restore) {
            Serialport.SerialPort.restore();
        }
        if (Buffer.getInstance.restore) {
            Buffer.getInstance.restore();
        }
    });

    describe('Initialise', function() {
        it('should create a buffer instance', function() {
            var plugwise = new Plugwise();
            assert(plugwise.buffer instanceof Buffer);
        });

        it('should send the initialise message to the serial port', function(done) {
            stubSerialPort();
            var plugwise = new Plugwise();
            plugwise.connect('some-port', function() {});
            plugwise.serialPort.emit('open');
            assert.equal(1, plugwise.serialPort.write.callCount);
            assert.equal(
                '\x05\x05\x03\x03\x30\x30\x30\x41\x42\x34\x33\x43\x0D\x0A',
                plugwise.serialPort.write.firstCall.args[0]
            );
            done();
        });
    });

    describe('List ports', function() {
        it('should call serialport.list', function(done) {
            var spy = sinon.spy(Serialport, 'list');
            new Plugwise().getSerialPorts(function() {
                assert.equal(1, spy.callCount);
                done();
            });
        });

        it('should return an empty array if serialport.list returns an error', function(done) {
            stubListError();
            new Plugwise().getSerialPorts(function(ports) {
                assert.equal(true, Array.isArray(ports));
                assert.equal(0, ports.length);
                done();
            });
        });

        it('should return an empty array if serialport.list does not return an array ', function(done) {
            stubList();
            new Plugwise().getSerialPorts(function(ports) {
                assert.equal(true, Array.isArray(ports));
                assert.equal(0, ports.length);
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
        });

        it('should have a property connected to still be false if there was an error', function() {
            sinon.stub(Serialport, 'SerialPort').yields('some error');
            var plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            assert(!plugwise.connected);
        });

        it('should store the returned value if there was no error connecting', function() {
            stubSerialPort();
            var spy = sinon.spy();
            var plugwise = new Plugwise();
            plugwise.connect('port-name', spy);
            assert.equal(spy.firstCall.args[1], 'Connected');
            assert(plugwise.serialPort !== undefined);
            assert(plugwise.serialPort.some === 'object');
        });

        it('should set its connected property to true if there was no error', function() {
            stubSerialPort();
            var plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            assert(plugwise.connected);
        });
    });

    describe('Receive messages', function() {
        
        var MockBuffer = function() {};
        util.inherits(MockBuffer, EventEmitter);

        it('should send messages recieved from the serial port to the buffer', function() {
            var plugwise,
                buffer = new Buffer();
            
            stubSerialPort();
            sinon.spy(buffer, 'store');
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            plugwise.connect('some-port', function() {});
            plugwise.serialPort.emit('data', 'some data');

            assert.equal(1, plugwise.buffer.store.callCount);
        });

        it('should pass buffer data to the buffer processor', function() {
            var mockBuffer = new MockBuffer(),
                bufferProcessorSpy = sinon.spy(BufferProcessor, 'process'),
                plugwise;

            sinon.stub(Buffer, 'getInstance', function() {return (mockBuffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            mockBuffer.emit('BUFFER-RECV-messages', ['hello']); 
            
            assert.equal(bufferProcessorSpy.firstCall.args[0], 'hello');
        });
    });

    describe('Send message', function() {
        it('should queue a message and send it to the serial', function() {
            var plugwise,
                buffer = new Buffer(),
                message = 'hello world';

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);

            assert.equal(1, plugwise.serialPort.write.callCount);
            assert.equal(
                message,
                plugwise.serialPort.write.firstCall.args[0]
            );
        });

        it('should not send a second message if the first message has not been acknowldeged', function() {
           var plugwise,
                buffer = new Buffer(),
                messages = ['message1', 'message2'];

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            messages.forEach(function(message) {
                plugwise.send(message);            
            });

            assert.equal(1, plugwise.serialPort.write.callCount);
            assert.equal(
                messages[0],
                plugwise.serialPort.write.firstCall.args[0]
            );
        });

        it('should send the second message when the first message is acknowledged', function() {
            var plugwise,
                buffer = new Buffer(),
                messages = ['message1', 'message2'];

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            messages.forEach(function(message) {
                plugwise.send(message);            
            });

            assert.equal(2, plugwise.serialPort.write.callCount);
        });
    });
});