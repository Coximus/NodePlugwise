var PlugwiseMessageStringHelper = require('../helpers/generate-plugwise-message-string');

module.exports = function(msgData) {
    var sequenceNo = msgData ? msgData.sequenceNumber || "0001" : "0001";

    return PlugwiseMessageStringHelper({code: "0000", sequenceNumber: sequenceNo, parameters: "00E1"})
}