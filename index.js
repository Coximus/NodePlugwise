var Serial = require('serialport'),
    Promise = require('bluebird');

var Plugwise = function() {
    this.serialPort;
    this.connected = false;
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