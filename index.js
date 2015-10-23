var Serial = require('serialport'),
    Promise = require('bluebird');

var Plugwise = {
    getSerialPorts: function() {
        var test = Serial.list;
        var newTest = Promise.promisify(test);
        var temp = null;
        newTest().then(function(ports) {
                // console.log(ports);
                temp =  ports;
            });

        return temp;

        Serial.list(function (err, ports) {
          ports.forEach(function(port) {
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
          });
        });
    }
}

Plugwise.getSerialPorts();

module.exports = Plugwise;