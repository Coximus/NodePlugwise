var Serial = require('serialport'),
    Buffer = require('./buffer'),
    BufferProcessor = require('./bufferProcessor'),
    CommandSequence = require('./CommandSequence'),
    CommandSequenceProcessor = require('./commandSequenceProcessor'),
    TransmissionMessages = require('./PlugwiseTxMessages/TransmissionMessages');

var getCommandSequenceBySequenceNumber = function(commandSequences, sequenceNo) {
    for(var i = 0; i < commandSequences.length; i++) {
        if (commandSequences[i].sequenceNumber === sequenceNo) {
            return commandSequences[i];
        }
    }
}

var Plugwise = function() {
    this.serialPort;
    this.connected = false;
    this.buffer = Buffer.getInstance();
    this.buffer.addPatternStart('\x05\x05\x03\x03');
    this.buffer.setPatternEnd('(?:\x0D\x0A\x83|\x0D\x0A)');
    this.buffer.on('BUFFER-RECV-messages', function(messages) {
        messages.forEach(function(message) {
            this.processPlugwiseMessage(message);
        }.bind(this));
    }.bind(this));
    
    this.txMsg = null;
    this.txQueue = [];
    this.commandsInFlight = [];
};

Plugwise.prototype.send = function(message) {
    if (!this.txMsg) {
        this.txMsg = message;
        return this.serialPort.write(message.message);
    }
    
    this.txQueue.push(message);
};

Plugwise.prototype.processPlugwiseMessage = function(msg) {
    var plugwiseMsg = BufferProcessor.process(msg);
    var commandSequence;
    if (!plugwiseMsg) {
        return;
    }

    if (plugwiseMsg.isAck()) {
        commandSequence = new CommandSequence(this.txMsg);
        commandSequence.setSequenceNumber(plugwiseMsg.sequenceNo)
        this.commandsInFlight.push(commandSequence);
        this.txMsg = null;
        if(this.txQueue.length > 0) {
            this.send(this.txQueue.shift());
        }
        return;
    }
    var commandSequence = getCommandSequenceBySequenceNumber(this.commandsInFlight, plugwiseMsg.sequenceNo);
    if (commandSequence) {
        commandSequence.addReception(plugwiseMsg);
        CommandSequenceProcessor.Process(commandSequence);
    }
}

Plugwise.prototype.initialiseSerial = function() {
    this.send(new TransmissionMessages.Initialise(function(error, messages) {
        if (error) {
            console.error(error);
        }
        console.log(messages);
    }));
};

Plugwise.prototype.recieveSerialData = function(data) {
    this.buffer.store(data);
};

Plugwise.prototype.connect = function(serialPort, callback) {
    this.serialPort = new Serial.SerialPort(serialPort, {baudrate: 115200}, true, function(err) {
        if(err !== undefined && err !== null) {
            return callback(err)
        }

        this.connected = true;
        return callback(null, 'Connected');
    }.bind(this));
    if (this.serialPort.on) {
        this.serialPort.on('open', this.initialiseSerial.bind(this));
        this.serialPort.on('data', function(data) {
            this.recieveSerialData(data);
        }.bind(this));
    }
};

Plugwise.prototype.getSerialPorts = function(callback) {
    Serial.list(function (err, ports) {
        if (!(err === undefined || err === null) || !Array.isArray(ports)) {
            return callback([]);
        }
        var validPorts = ports.filter(function(port) {
            return port.manufacturer && port.manufacturer === "FTDI";
        });
        return callback(validPorts);
    });
};

var test = new Plugwise();
test.connect('/dev/ttyUSB0', function() {
    console.log('my connected');
});

module.exports = Plugwise;