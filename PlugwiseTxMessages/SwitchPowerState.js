var txMessageModel = require('../TransmissionMessageModel');

var plugAddressValid = function(plugAddress) {
    return plugAddress !== null && 
        plugAddress !== undefined &&
        plugAddress.length === 16;
}

var desiredStateValid = function(desiredState) {
    return desiredState === 0 || desiredState === 1;
}

var generateMessage = function(plugAddress, desiredState) {
    return "0017" + plugAddress + (desiredState == 0 ? "00" : "01");
}

var SwitchPowerState = function(plugAddress, desiredState, callback) {
    var genericErrorMessage = 'There was an error communicating with plug ' + plugAddress;

    if (!plugAddressValid(plugAddress)) {
        return callback('Invalid plug address specified');
    }

    if (!desiredStateValid(desiredState)) {
        return callback("Invalid desired state");
    }

    var processMessages = function(error, messages) {
        if (error && error === "NACK receieved") {
            return callback('The plug ' + plugAddress + ' is not responding', null);
        }
        if (error || !messages || (messages.length !== 1)) {
            return callback(genericErrorMessage, null);
        }

        if (messages[0].code !== '0000') {
            return callback(genericErrorMessage, null);   
        }

        if (!messages[0].parameters || messages[0].parameters.length !== 20) {
            return callback(genericErrorMessage, null);
        }

        var responseCode = messages[0].parameters.substring(0,4),
            responseAddress = messages[0].parameters.substring(4);

        if (responseCode !== '00D8' && responseCode !== '00DE') {
            return callback(genericErrorMessage, null);
        }

        if (responseAddress !== plugAddress) {
            return callback(genericErrorMessage, null);
        }

        return callback(null, {plugAddress: plugAddress, state: desiredState});
    };

    this.__proto__ = txMessageModel(
        { type: 1, message: generateMessage(plugAddress, desiredState) },
        processMessages
    );
} 

module.exports = SwitchPowerState;