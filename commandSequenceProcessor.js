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

        if (NAckReceived(commandSequence.receptions)) {
            commandSequence.stopTimer();
            return commandSequence.transmission.callback("NACK receieved");
        }
        if (receptions.length === typeResonseCountMap[commandSequence.transmission.type]) {
            commandSequence.stopTimer();
            return commandSequence.transmission.callback(null, commandSequence.receptions);
        }
        if (receptions.length > typeResonseCountMap[commandSequence.transmission.type]) {
            commandSequence.stopTimer();
            return commandSequence.transmission.callback("Too many messages were received");
        }
    }
}