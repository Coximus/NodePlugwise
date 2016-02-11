var util         = require("util");
var EventEmitter = require("events").EventEmitter;

var Buffer = function() {
	this.buffer = "";
	this.bufferStart = [];
	EventEmitter.call(this);
	this.processBuffer = function() {
		var bufferEnd = "(.*" + "\n" + ")+",
			splitMatch = "\n",
			completedMessage,
			messages = [],
			bufferMatch;

		if (this.bufferEnd) {
			bufferEnd = new RegExp("(.*" + this.bufferEnd + ")+");
			splitMatch = new RegExp(this.bufferEnd);
		}

		if (this.bufferStart.length > 0) {			
			bufferMatch = new RegExp("(?:[" + this.bufferStart.join('|') + "])(.*)");
		}
		
		completedMessage = this.buffer.match(bufferEnd);
		if (completedMessage) {
			messages = completedMessage[0].split(splitMatch).map(function(message) {
				if (!bufferMatch) {
					return message;
				}
				var match = message.match(bufferMatch);
				return (match) ? match[1] : "";
			}).filter(function(message) {
				return message !== "";
			}.bind(this));
			this.buffer = this.buffer.substr(completedMessage[0].length);
		}
		this.emit('BUFFER-RECV-messages', messages);
	}
};

util.inherits(Buffer, EventEmitter);

Buffer.prototype.store = function(data) {
	this.buffer += data;
	this.processBuffer();
};

Buffer.prototype.setPatternEnd = function(endPattern) {
	this.bufferEnd = endPattern;
};

Buffer.prototype.addPatternStart = function(startPattern) {
	this.bufferStart.push(startPattern);
}

module.exports = Buffer;
module.exports.getInstance = function() { return new Buffer() };