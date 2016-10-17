var assert = require('assert'),
    sinon = require('sinon'),
    Plugwise = require('../../Plugwise.js'),
    Serialport = require('serialport'),
    Buffer = require('../../buffer'),
    BufferProcessor = require('../../bufferProcessor'),
    util = require("util"),
    EventEmitter = require("events").EventEmitter,
    transmissionMessage = require('../../TransmissionMessageModel'),
    CommandSequenceProcessor = require('../../commandSequenceProcessor'),
    PlugwiseMessageStringHelper = require('../helpers/generate-plugwise-message-string'),
    PlugwiseAckMessageStringHelper = require('../helpers/generate-plugwise-ack-string');

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
        if (BufferProcessor.process.restore) {
            BufferProcessor.process.restore();
        }
        if (CommandSequenceProcessor.Process.restore) {
            CommandSequenceProcessor.Process.restore();
        };
    });

    describe('Initialise', function() {
        it('should create a buffer instance', function() {
            var plugwise = new Plugwise();
            assert(plugwise.buffer instanceof Buffer);
        });

        it('should set the buffer start match', function() {
            var plugwise,
                buffer = new Buffer(),
                spy = sinon.spy(buffer, 'addPatternStart');

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            assert.equal('\x05\x05\x03\x03', spy.firstCall.args[0]);
        });

        it('should set the buffer end match', function() {
            var plugwise,
                buffer = new Buffer(),
                spy = sinon.spy(buffer, 'setPatternEnd');

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();
            assert.equal('(?:\x0D\x0A\x83|\x0D\x0A)', spy.firstCall.args[0]);
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

        it('should store the network address from the initialise response', function(done) {
            var plugwise,
                buffer = new Buffer();

            stubSerialPort();
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();

            plugwise.connect('some-port', function() {});
            plugwise.serialPort.emit('open');

            buffer.store(PlugwiseAckMessageStringHelper());
            buffer.store('\x05\x05\x03\x0300110001000D6F000099558D0101480D6F0000768D955B48FF2A79\x0D\x0A');

            assert.equal('000D6F0000', plugwise.networkAddress);
            done();
        });

        it('should store the stick address from the initialise response', function(done) {
            var plugwise,
                buffer = new Buffer();

            stubSerialPort();
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();

            plugwise.connect('some-port', function() {});
            plugwise.serialPort.emit('open');
            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');
            buffer.store('\x05\x05\x03\x0300110001000D6F000099558D0101480D6F0000768D955B48FF2A79\x0D\x0A');

            assert.equal('99558D', plugwise.stickAddress);
            done();
        });

        it('should store the circlePlus address from the initialise response', function(done) {
            var plugwise,
                buffer = new Buffer();

            stubSerialPort();
            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            plugwise = new Plugwise();

            plugwise.connect('some-port', function() {});
            plugwise.serialPort.emit('open');
            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');
            buffer.store('\x05\x05\x03\x0300110001000D6F000099558D0101480D6F0000768D955B48FF2A79\x0D\x0A');

            assert.equal('768D95', plugwise.circlePlusAddress);
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
            var buffer = new Buffer(),
                bufferProcessorSpy = sinon.spy(BufferProcessor, 'process'),
                plugwise;

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');
            
            assert.equal(bufferProcessorSpy.firstCall.args[0], '0000000100C1FEED');
        });

        it('should add a CommandSequence to the communications buffer when reciving an Ack', function() {
            var buffer = new Buffer();

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            plugwise.send('message');

            assert.equal('message', plugwise.txMsg);
            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A\x83');
            assert.equal(null, plugwise.txMsg);
            
            assert.equal(1, plugwise.commandsInFlight.length);
        });

        it('should set the sequence number of a CommandSequence when recieving an Ack', function() {
            var buffer = new Buffer();

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            plugwise.send('message');

            assert.equal('message', plugwise.txMsg);
            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');
            assert.equal(null, plugwise.txMsg);
            
            assert.equal('0001', plugwise.commandsInFlight[0].sequenceNumber);
        });

        it('should store incomming messages in the relevant command sequences', function() {
            var buffer = new Buffer();

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            plugwise.send('message');
            plugwise.send('message2');

            assert.equal('message', plugwise.txMsg);
            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');

            assert.equal('message2', plugwise.txMsg);
            buffer.store('\x05\x05\x03\x030000000200C1103F\x0D\x0A');
            assert.equal(null, plugwise.txMsg);
            
            buffer.store('\x05\x05\x03\x0300110001000D6F000099558D0101480D6F0000768D955B48FF2A79\x0D\x0A');

            assert.equal('0001', plugwise.commandsInFlight[0].sequenceNumber);
            assert.equal('0002', plugwise.commandsInFlight[1].sequenceNumber);

            assert.equal(1, plugwise.commandsInFlight[0].receptions.length);
            assert.equal(0, plugwise.commandsInFlight[1].receptions.length);
        });

        it('should not store incomming messages if they do not have a relevant command sequences', function() {
            var buffer = new Buffer();

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            plugwise.send('message');
            plugwise.send('message2');

            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A\x05\x05\x03\x030000000200C1103F\x0D\x0A');
            
            buffer.store('\x05\x05\x03\x0300110003000D6F000099558D0101480D6F0000768D955B48FFFF6D\x0D\x0A');

            assert.equal(2, plugwise.commandsInFlight.length);
            assert.equal(0, plugwise.commandsInFlight[0].receptions.length);
            assert.equal(0, plugwise.commandsInFlight[1].receptions.length);
        });

        it('should pass the command sequence to the CommandSequenceProcessor', function() {
            var buffer = new Buffer(),
                processSpy = sinon.spy(CommandSequenceProcessor, 'Process');

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port-name', function(){});
            plugwise.send('message');

            buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');
            buffer.store('\x05\x05\x03\x0300110001000D6F000099558D0101480D6F0000768D955B48FF2A79\x0D\x0A');

            assert.equal(1, processSpy.callCount);
        });
    });

    describe('Send message', function() {
        it('should queue a message and send it to the serial', function() {
            var plugwise,
                buffer = new Buffer(),
                message = new transmissionMessage({message: 'hello world'});

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);

            assert.equal(1, plugwise.serialPort.write.callCount);
            assert.equal(
                message.message,
                plugwise.serialPort.write.firstCall.args[0]
            );
        });

        it('should not send a second message if the first message has not been acknowldeged', function() {
           var plugwise,
                buffer = new Buffer(),
                messages = [
                    new transmissionMessage({message: 'message1'}),
                    new transmissionMessage({message: 'message2'})
                ];

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            messages.forEach(function(message) {
                plugwise.send(message);            
            });

            assert.equal(1, plugwise.serialPort.write.callCount);
            assert.equal(
                messages[0].message,
                plugwise.serialPort.write.firstCall.args[0]
            );
        });

        it('should send the second message when the first message is acknowledged', function() {
            var plugwise,
                buffer = new Buffer(),
                messages = ['message1', 'message2', 'message3'];


            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            messages.forEach(function(message, index) {
                plugwise.send(message);
                buffer.store('\x05\x05\x03\x030000000100C1FEED\x0D\x0A');
            });

            assert.equal(3, plugwise.serialPort.write.callCount);
            messages.forEach(function(message, index) {
                assert.equal(messages[index].message, plugwise.serialPort.write.getCall(index).args[0]);
            });
        });

        it('should start the acknowledgement timer for a message as it is sent', function() {
            var plugwise,
                buffer = new Buffer(),
                message = new transmissionMessage({message: 'hello world'}),
                timerSpy = sinon.spy(message, 'startAckTimer');

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);

            assert.equal(1, timerSpy.callCount);
        });

        it('should remove the txMsg if not acknowledged before the ACK timeout', function(done) {
            process.env.NODE_ENV = 'test';
            var plugwise,
                buffer = new Buffer(),
                message = new transmissionMessage({message: 'not acked'});

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);

            assert.notEqual(null, plugwise.txMsg);
            setTimeout(function() {
                assert.equal(null, plugwise.txMsg);
                done();
            },10);
        });

        it('should call the message callback with an error if the ack timer times out', function(done) {
            process.env.NODE_ENV = 'test';
            var plugwise,
                buffer = new Buffer(),
                message = new transmissionMessage({message: 'not acked'}, sinon.spy());

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);

            assert.notEqual(null, plugwise.txMsg);
            setTimeout(function() {
                assert(message.callback.called);
                assert(message.callback.firstCall.args[0]);
                done();
            },10);
        });

        it('should stop the ackTimer if an ack is recieved before the ack time out', function() {
            process.env.NODE_ENV = 'test';
            var plugwise,
                buffer = new Buffer(),
                message = new transmissionMessage({message: 'going to be acked'}),
                clearTimerSpy = sinon.spy(message, 'clearAckTimer');

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();
            
            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);
            buffer.store(PlugwiseAckMessageStringHelper());

            assert.equal(1, clearTimerSpy.callCount);
        });

        it('should start the command sequence timer when an ack is recieved', function(done) {
            process.env.NODE_ENV = 'test';
            var plugwise,
                buffer = new Buffer(),
                message = new transmissionMessage({message: 'should start a timer'},function(error, response){
                    assert.equal(error, 'Message timed out');
                    done();
                });

            sinon.stub(Buffer, 'getInstance', function() {return (buffer)});
            stubSerialPort();

            plugwise = new Plugwise();
            plugwise.connect('port', function(){});
            plugwise.send(message);
            buffer.store(PlugwiseAckMessageStringHelper());
        });
    });
});