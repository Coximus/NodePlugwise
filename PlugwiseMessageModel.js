var PlugwiseMessageModel = function(message) {
    this.code = message.code || null;
    this.sequenceNo = message.sequenceNo || null;
    this.parameters = message.parameters || null;
};

PlugwiseMessageModel.prototype.isAck = function() {
    return this.code === "0000" && this.parameters === "00C1";
};

module.exports = PlugwiseMessageModel;