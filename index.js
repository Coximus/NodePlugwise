var Serial = require('serialport'),
    Buffer = require('./buffer');

var Plugwise = function() {
    this.serialPort;
    this.connected = false;
    this.buffer = Buffer.getInstance();
    this.buffer.on('BUFFER-RECV-messages', function(messages) {
        messages.forEach(function(message) {
            console.log(message);
        });
    });
};

Plugwise.prototype.sendInitMessage = function(callback) {
    if (!this.connected || !this.serialPort) {
        return callback('You must connect to a serial port before calling init', false);
    } 
    this.serialPort.write('\x05\x05\x03\x03\x30\x30\x30\x30\x30\x30\x30\x31\x30\x30\x43\x31');
    return callback(null, true);
};

Plugwise.prototype.connect = function(serialPort, callback) {
    this.serialPort = new Serial.SerialPort(serialPort, {baudrate: 115200}, true, function(err) {
        if(err !== undefined && err !== null) {
            return callback(err)
        }

        this.connected = true;
        return callback(null, 'Connected');
    }.bind(this));
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