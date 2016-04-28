var MessageModel = function(msg) {
	this.type = msg.type === 0 ? 0 : msg.type  || null;
	this.message = msg.message || null;
	this.onSuccess = msg.onSuccess || null;
	this.onError = msg.onError || null;
}

module.exports = MessageModel;