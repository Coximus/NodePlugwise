var typeResonseCountMap = {
    0: 1,
    1: 1,
    2: 2
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
        if (!commandSequence.transmission.callback){
            return;
        }
        var receptions = commandSequence.receptions;
        // TODO : should callback with an error object with an error.type
        // then anything consuming the error can compare on its type.
        if (NAckReceived(commandSequence.receptions)) {
            return commandSequence.transmission.callback("NACK receieved");
        }
        if (receptions.length === typeResonseCountMap[commandSequence.transmission.type]) {
            return commandSequence.transmission.callback(null, commandSequence.receptions);
        }
        if (receptions.length > typeResonseCountMap[commandSequence.transmission.type]) {
            return commandSequence.transmission.callback("Too many messages were received");
        }
    }
}