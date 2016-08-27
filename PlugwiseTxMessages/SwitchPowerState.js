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
        console.log(messages);
        if (error || !messages || (messages.length !== 1)) {
            return callback(genericErrorMessage, null);
        }

        if (!messages[0].isAck() && !messages[0].isNAck()) {
            return callback(genericErrorMessage, null);
        }

        if (messages[0].isNAck()) {
            return callback('The plug ' + plugAddress + ' is not responding', null);
        }

        return callback(null, {plugAddress: plugAddress, state: desiredState});
    };

    this.__proto__ = txMessageModel(
        { type: 1, message: generateMessage(plugAddress, desiredState) },
        processMessages
    );
} 

module.exports = SwitchPowerState;