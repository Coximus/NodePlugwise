var MessageModel = function(msg) {
	this.message = msg.message || null;
	this.onSuccess = msg.onSuccess || null;
	this.onError = msg.onError || null;
}

module.exports = MessageModel;