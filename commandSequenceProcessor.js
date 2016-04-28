var typeResonseCountMap = {
    0: 2
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
            return commandSequence.transmission.onError();
        }
        if (receptions.length === typeResonseCountMap[commandSequence.transmission.type]) {
            return commandSequence.transmission.onSuccess();
        }
        if (receptions.length > typeResonseCountMap[commandSequence.transmission.type]) {
            return commandSequence.transmission.onError();
        }
    }
}