var typeResonseCountMap = {
    0: 1,
    1: 2
};

var NAckReceived = function(receptions) {
    var i = 0;
    for(i = 0; i < receptions.length; i++) {
        if (receptions[i].isNAck()) {
            return true;
        }
    }
    return false;
}

module.exports = {
    Process: function(commandSequence) {
        var receptions = commandSequence.receptions;
        if (NAckReceived(commandSequence.receptions)) {
            return commandSequence.transmission.callback("NACK receieved");
        }
        if (receptions.length === typeResonseCountMap[commandSequence.transmission.type]) {
            return commandSequence.transmission.callback(null, ""); //TODO - make sure we pass the messages
        }
        if (receptions.length > typeResonseCountMap[commandSequence.transmission.type]) {
            return commandSequence.transmission.callback("Too many messages were received");
        }
    }
}