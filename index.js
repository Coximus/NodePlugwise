var Plugwise = require('./Plugwise'),
    plugwise;

var connectToPlugwise = function(serial, callback) {
    plugwise = Plugwise.getInstance();
    plugwise.connect(serial, function(error) {
        if(error) {
            return callback(error);
        }
        return callback(null, plugwise);
    });
}

var callSwitchPlug = function(plugId, desiredState, callback) {
    plugwise.switchPlug(plugId, desiredState, callback);
}

module.exports = {
    connect: function(serial, callback) {
        connectToPlugwise(serial, function(error, plugwise) {
            if(callback) {
                callback(error, plugwise);
            }
        });
    },
    switchPlug: function(plugId, desiredState, callback) {
        if(plugwise && plugwise.connected) {
            return callSwitchPlug(plugId, desiredState, callback);
        }
        return callback('Plugwise not connected');
    }
};