var CRC = require('crc');

function getAckTimeout() {
    return process.env.NODE_ENV === 'test' ? 0 : 1000;
}

function pad(input, size) {
    var s = input+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function startAckTimer(callback) {
    this.ackTimer = setTimeout(function() {
        if (callback) {
            callback.bind(this)();
        }
    }.bind(this), getAckTimeout());
}

function clearAckTimer() {
    clearTimeout(this.ackTimer);
    this.ackTimer = null;
}

var MessageModel = function(message, callback) {
    var msg = message.message || "",
        header = "\x05\x05\x03\x03",
        footer = "\x0D\x0A",
        crc = pad(CRC.crc16xmodem(msg).toString(16).toUpperCase(), 4);

    return {
        type: message.type === 0 ? 0 : message.type  || null,
        message: header + msg + crc  + footer,
        callback: callback || null,
        startAckTimer: startAckTimer,
        clearAckTimer: clearAckTimer
    }
	
}

module.exports = MessageModel;