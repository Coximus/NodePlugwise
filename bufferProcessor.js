var PlugwiseMessage = require('./PlugwiseMessageModel'),
    CRC = require('crc');

function bufferLengthValid(buffer) {
    return buffer.length >= 12;
}

function crcValid(buffer) {
    var payload = buffer.substring(0,buffer.length-4),
        crc = buffer.substring(buffer.length-4),
        calcualtedCRC = CRC.crc16xmodem(payload).toString(16).toUpperCase();

    return crc === calcualtedCRC;
}

module.exports =
{
    process: function(buffer) {
        if (!bufferLengthValid(buffer) || !crcValid(buffer)) {
            return;
        }

        var bufferCode = buffer.substring(0, 4);
        var sequenceNo = buffer.substring(4, 8);
        var parameters = buffer.substring(8, buffer.length-4);

        return new PlugwiseMessage({'code': bufferCode, 'sequenceNo': sequenceNo, 'parameters': parameters});
    }
}