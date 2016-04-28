var assert = require('assert'),
    MessageModel = require('../../TransmissionMessageModel');

describe('Transmission Message Model', function() {
    it('should store the type passed through the constructor', function() {
        var type = 0,
            message = new MessageModel({type: type});

        assert.equal(type, message.type);
    });

    it('should store the message passed through the constructor', function() {
        var msg = "Hello World",
            message = new MessageModel({message: msg});

        assert.equal(msg, message.message);
    });

    it('should store the onSuccess callback passed through the constructor', function() {
        var callback = function(){},
            message = new MessageModel({onSuccess: callback});

        assert.equal(callback, message.onSuccess); 
    });

    it('should store the onError callback passed through the constructor', function() {
        var callback = function(){},
            message = new MessageModel({onError: callback});

        assert.equal(callback, message.onError); 
    });

    it('should default to null for the message, onSuccess and onError properties', function() {
        var message = new MessageModel({});

        assert.deepEqual(null, message.type);
        assert.notDeepEqual(undefined, message.type);
        assert.deepEqual(null, message.message);
        assert.notDeepEqual(undefined, message.message);
        assert.deepEqual(null, message.onSuccess);
        assert.notDeepEqual(undefined, message.onSuccess);
        assert.deepEqual(null, message.onError);
        assert.notDeepEqual(undefined, message.onError);
    });
});