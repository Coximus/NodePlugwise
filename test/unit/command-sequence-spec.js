var assert = require('assert'),
    PlugwiseMessageModel = require('../../PlugwiseMessageModel'),
    CommandSequence = require('../../CommandSequence');

describe('Command Sequence', function() {
    describe('Transmission Message', function() {
        it('should set the default initial transmission message to null if one is not passed in', function() {
            var commandSequence = new CommandSequence();

            assert.equal(null, commandSequence.transmission);
        });

        it('should set the initial transmission message', function() {
            var message = new PlugwiseMessageModel({code: '000A'}),
                commandSequence = new CommandSequence(message);

            assert.equal(message, commandSequence.transmission);
        });

        it('should allow settings of the transmission message', function() {
            var message = new PlugwiseMessageModel({code: '000A'}),
                commandSequence = new CommandSequence();

            commandSequence.setTransmissionMessage(message);
            assert.equal(message, commandSequence.transmission);
        });
    });

    describe('Sequence Number', function() {
        it('should have an initial sequence number of null', function() {
            var commandSequence = new CommandSequence();

            assert.equal(null, commandSequence.sequenceNumber);
        });

        it('should allow setting of the sequence number', function() {
            var commandSequence = new CommandSequence();

            commandSequence.setSequenceNumber("0001");

            assert.equal("0001", commandSequence.sequenceNumber);
        });
    });

    describe('Recived Message', function() {
        it('should initialise an empty array for recieved messages', function() {
            var commandSequence = new CommandSequence();

            assert(Array.isArray(commandSequence.receptions));
        });

        it('should allow recieevd messages to be added to the receptions array', function() {
            var commandSequence = new CommandSequence(),
                messages = [new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00C1"}),
                    new PlugwiseMessageModel({code: "0001", sequenceNo: "0001", parameters: "00C1"})];

            messages.forEach(function(message, index) {
                commandSequence.addReception(message);
                assert.equal(message.code,commandSequence.receptions[index].code);
                assert.equal(index+1,commandSequence.receptions.length);
            });
        });
    });
});