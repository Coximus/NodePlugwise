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
    this.networkAddress;
    this.stickAddress;
    this.circlePlusAddress;
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

var notAcknowledgedCallback = function() {
    if (this.txMsg) {
        this.txMsg = null;
    }
};

Plugwise.prototype.send = function(message) {
    if (!this.txMsg) {
        this.txMsg = message;
        this.serialPort.write(message.message);
        if (message.startAckTimer) {
            message.startAckTimer.bind(this)(notAcknowledgedCallback, this);
        }
        return;
    }
    
    this.txQueue.push(message);
};

Plugwise.prototype.processPlugwiseMessage = function(msg) {
    var plugwiseMsg = BufferProcessor.process(msg),
        commandSequence;
    
    if (!plugwiseMsg) {
        return;
    }

    commandSequence = getCommandSequenceBySequenceNumber(this.commandsInFlight, plugwiseMsg.sequenceNo);
    if (commandSequence) {
        commandSequence.addReception(plugwiseMsg);
        CommandSequenceProcessor.Process(commandSequence);
    }

    if (plugwiseMsg.isAck()) {
        if(this.txMsg && this.txMsg.clearAckTimer){
            this.txMsg.clearAckTimer();
        }
        commandSequence = new CommandSequence(this.txMsg);
        commandSequence.setSequenceNumber(plugwiseMsg.sequenceNo)
        this.commandsInFlight.push(commandSequence);
        this.txMsg = null;
        if(this.txQueue.length > 0) {
            this.send(this.txQueue.shift());
        }
        return;
    }
}

Plugwise.prototype.initialiseSerial = function() {
    this.send(new TransmissionMessages.Initialise(function(error, networkData) {
        if (error) {
            console.error(error);
        }
        this.networkAddress = networkData.network;
        this.stickAddress = networkData.stick;
        this.circlePlusAddress = networkData.circlePlus;
    }.bind(this)));
};

Plugwise.prototype.switchPlug = function(plugAddress, desiredState, callback) {
    var txMessage = new TransmissionMessages.SwitchPower(plugAddress, desiredState, function(error, response) {
        callback(error, response);
    }.bind(this));
    if (txMessage.message) {
        this.send(txMessage);
    }
}

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

module.exports = Plugwise;
module.exports.getInstance = function() { return new Plugwise() };