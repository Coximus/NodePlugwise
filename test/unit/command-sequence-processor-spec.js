var assert = require('assert'),
    sinon = require('sinon'),
    CommandSequenceProcessor = require('../../commandSequenceProcessor.js'),
    CommandSequence = require('../../CommandSequence.js'),
    PlugwiseMessageModel = require('../../PlugwiseMessageModel.js'),
    TransmissionMessageModel = require('../../TransmissionMessageModel');

 describe('Command Sequence Processor', function() {

    var getTransmissionMessage = function() {
        return new TransmissionMessageModel({
            type: 0,
            message: "hello world",
            onError: sinon.spy(),
            onSuccess: sinon.spy()
        });
    };

    var getCommandSequence = function() {
        var txMessage = getTransmissionMessage();
        return commandSequence = new CommandSequence(txMessage);
    }

    var acknowledgeCommandSequence = function(commandSequence) {
        var ackMessage = new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00C1"});

        commandSequence.setSequenceNumber('0001');
        commandSequence.addReception(ackMessage);
    }

    describe('Receiving a negative acknowledgement', function() {
        it('should call the onError callback and the onSuccess callback should not be called', function() {
            var nackMessage = new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00E1"}),
                commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);
            commandSequence.addReception(nackMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert(commandSequence.transmission.onError.called);
            assert(!commandSequence.transmission.onSuccess.called);
        });
    });

    describe('Recieving responses', function() {
        it('should call the onSuccess callback when reaching the correct number of responses has been revcieved', function() {
            var followupMessage = new PlugwiseMessageModel({code: "1234", sequenceNo: "0001", parameters: "SOME-PARAMETERS"}),
                commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);
            CommandSequenceProcessor.Process(commandSequence);

            assert(!commandSequence.transmission.onError.called);
            assert(!commandSequence.transmission.onSuccess.called);

            commandSequence.addReception(followupMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert(!commandSequence.transmission.onError.called);
            assert(commandSequence.transmission.onSuccess.called);
        });

        it('should call onError when recieving more messages than expected', function() {
            var followupMessage = new PlugwiseMessageModel({code: "1234", sequenceNo: "0001", parameters: "SOME-PARAMETERS"});
                commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);

            CommandSequenceProcessor.Process(commandSequence);
            assert(!commandSequence.transmission.onError.called);
            assert(!commandSequence.transmission.onSuccess.called);

            commandSequence.addReception(followupMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert(!commandSequence.transmission.onError.called);
            assert(commandSequence.transmission.onSuccess.called);

            commandSequence.addReception(followupMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert(commandSequence.transmission.onError.called);
            assert.equal(1, commandSequence.transmission.onSuccess.callCount);
        });

        it('should not call any callbacks if the number of messages received is less than the number of messages expected', function() {
            var commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);

            CommandSequenceProcessor.Process(commandSequence);
            assert(!commandSequence.transmission.onError.called);
            assert(!commandSequence.transmission.onSuccess.called);
        });
    });
 });