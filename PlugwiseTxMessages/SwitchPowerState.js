var txMessageModel = require('../TransmissionMessageModel');

var plugAddressValid = function(plugAddress) {
    return plugAddress !== null && 
        plugAddress !== undefined &&
        plugAddress.length === 16;
}

var desiredStateValid = function(desiredState) {
    return desiredState === 0 || desiredState === 1;
}

var SwitchPowerState = function(plugAddress, desiredState, callback) {
    if (!plugAddressValid(plugAddress)) {
        return callback('Invalid plug address specified');
    }

    if (!desiredStateValid(desiredState)) {
        return callback("Invalid desired state");
    }

    // var processMessages = function(error, messages) {
    //     if (error) {
    //         return callback(error);
    //     }

    //     var networkData,
    //         initResponses = messages.filter(function(message) {
    //             return message.code === '0011' && message.parameters.length === 42;
    //         });

    //     if (initResponses.length === 0) {
    //         return callback('No valid Initialisation Response found.');
    //     }

    //     networkData = {
    //         network: initResponses[0].parameters.substring(0,10),
    //         stick: initResponses[0].parameters.substring(10,16),
    //         circlePlus: initResponses[0].parameters.substring(30,36)
    //     }

    //     callback(null, networkData);
    // };

    this.__proto__ = txMessageModel(
        { type: 1 }
        // { type: 0, message: "\x30\x30\x30\x41"},
        // processMessages
    );
} 

module.exports = SwitchPowerState;