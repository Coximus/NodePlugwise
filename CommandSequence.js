var CommandSequence = function(txMessage) {
    this.transmission = txMessage || null;
    this.receptions = [];
};

CommandSequence.prototype.setTransmissionMessage = function(msg) {
    this.transmission = msg;
};

CommandSequence.prototype.setSequenceNumber = function(seqNo) {
    this.sequenceNumber = seqNo;
};

CommandSequence.prototype.addReception = function(message) {
    this.receptions.push(message);
};

module.exports = CommandSequence;