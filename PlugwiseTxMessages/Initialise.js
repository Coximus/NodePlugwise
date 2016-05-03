var txMessageModel = require('../TransmissionMessageModel');

var Initialise = function(callback) {
    var processMessages = function(error, messages) {
        if (error) {
            return callback(error);
        }

        var networkData,
            initResponses = messages.filter(function(message) {
                return message.code === '0011' && message.parameters.length === 42;
            });

        if (initResponses.length === 0) {
            return callback('No valid Initialisation Response found.');
        }

        networkData = {
            network: initResponses[0].parameters.substring(0,10),
            stick: initResponses[0].parameters.substring(10,16),
            circlePlus: initResponses[0].parameters.substring(30,36)
        }

        callback(null, networkData);
    };

    this.__proto__ = txMessageModel(
        { type: 0, message: "\x30\x30\x30\x41"},
        processMessages
    );
} 

module.exports = Initialise;