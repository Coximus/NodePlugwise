var assert = require('assert'),
    MessageModel = require('../../TransmissionMessageModel'),
    CRC = require('crc');

describe('Transmission Message Model', function() {
    var msg = "Hello World",
        header = "\x05\x05\x03\x03",
        footer = "\x0D\x0A",
        crc = CRC.crc16xmodem(msg).toString(16).toUpperCase();

    it('should store the type passed through the constructor', function() {
        var type = 0,
            message = new MessageModel({type: type});

        assert.equal(type, message.type);
    });

    it('should store the message passed through the constructor', function() {
        var message = new MessageModel({message: msg});

        assert.equal(header + msg + crc + footer, message.message);
    });

    it('should store the onSuccess callback passed through the constructor', function() {
        var callback = function(){},
            message = new MessageModel({}, callback);

        assert.equal(callback, message.callback); 
    });

    it('should default to null for the message, onSuccess and onError properties', function() {
        var message = new MessageModel({});

        assert.deepEqual(null, message.type);
        assert.notDeepEqual(undefined, message.type);
        assert.deepEqual(header+"0000"+footer, message.message);
        assert.notDeepEqual(undefined, message.message);
        assert.deepEqual(null, message.callback);
        assert.notDeepEqual(undefined, message.callback);
    });

    it('should add the header to the message', function() {
        var message = new MessageModel({message: msg});

        assert.equal(header + msg + crc + footer, message.message);
    });

    it('should add the footer to the message', function() {
        var message = new MessageModel({message: msg});

        assert.equal(header + msg + crc + footer, message.message);
    });

    it('should add the message CRC', function() {
        var message = new MessageModel({message: msg});

        assert.equal(header + msg + crc + footer, message.message);
    });
});