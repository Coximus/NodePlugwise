var util         = require("util");
var EventEmitter = require("events").EventEmitter;

var Buffer = function() {
	this.buffer = "";
	EventEmitter.call(this);
	this.processBuffer = function() {
		console.log(this.buffer.match('(.*?7)'));
		var messages = this.buffer.split("\n").filter(function(message) {
			return message !== "";
		}.bind(this));
		this.emit('messages', messages);
	}
}

util.inherits(Buffer, EventEmitter);

Buffer.prototype.store = function(data) {
	this.buffer += data;
	this.processBuffer();
}

module.exports = Buffer;