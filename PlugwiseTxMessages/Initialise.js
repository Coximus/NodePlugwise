var txMessageModel = require('../TransmissionMessageModel');

var Initialise = function(callback) {
    var processMessages = function(error, messages) {
        if (error) {
            callback(console.error(error));
        }

        var networkData = {
            network: messages[0].parameters.substring(0,10),
            stick: messages[0].parameters.substring(10,16),
            circlePlus: messages[0].parameters.substring(30,36)
        }

        callback(null, networkData);
    };

    this.__proto__ = txMessageModel(
        { type: 0, message: "\x30\x30\x30\x41"},
        processMessages
    );
} 

module.exports = Initialise;