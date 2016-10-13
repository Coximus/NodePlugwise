function getAckTimeout() {
    return process.env.NODE_ENV === 'test' ? 10 : 1000;
}

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

CommandSequence.prototype.startTimer = function(callback) {
    this.timer = setTimeout(callback.bind(null, this), getAckTimeout());
};

CommandSequence.prototype.stopTimer = function() {
    clearTimeout(this.timer);
};

CommandSequence.prototype.resetTimer = function() {
    var callback = this.timer._onTimeout;
    clearTimeout(this.timer);
    this.startTimer(callback);
};

module.exports = CommandSequence;