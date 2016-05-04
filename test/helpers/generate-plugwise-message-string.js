var CRC = require('crc');

module.exports = function(msgData) {
    var code = msgData.code || "0000",
        sequenceNo = msgData.sequenceNumber || "0000",
        parameters = msgData.parameters || ""
        crc = CRC.crc16xmodem(code + sequenceNo + parameters).toString(16).toUpperCase();

    return '\x05\x05\x03\x03' + code + sequenceNo + parameters + crc + '\x0D\x0A';
}