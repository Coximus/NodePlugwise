var PlugwiseMessageModel = function(message) {
	this.code = message.code || null;
	this.sequenceNo = message.sequenceNo || null;
	this.parameters = message.parameters || null;
};

module.exports = PlugwiseMessageModel;