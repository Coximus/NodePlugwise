var assert = require('assert'),
    sinon = require('sinon'),
    CommandSequenceProcessor = require('../../commandSequenceProcessor.js'),
    CommandSequence = require('../../CommandSequence.js'),
    PlugwiseMessageModel = require('../../PlugwiseMessageModel.js'),
    TransmissionMessageModel = require('../../TransmissionMessageModel');

 describe('Command Sequence Processor', function() {

    var getTransmissionMessage = function(txMsg) {
        return new TransmissionMessageModel(
            {type: 1, message: "hello world"},
            txMsg ? txMsg.callback === null ? null : sinon.spy() : sinon.spy()
        );
    };

    var getCommandSequence = function(txMsg) {
        var txMessage = getTransmissionMessage(txMsg);
        return commandSequence = new CommandSequence(txMessage);
    }

    var acknowledgeCommandSequence = function(commandSequence) {
        var ackMessage = new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00C1"});

        commandSequence.setSequenceNumber('0001');
        commandSequence.addReception(ackMessage);
    }

    describe('Receiving a negative acknowledgement', function() {
        it('should call the callback with an error', function() {
            var nackMessage = new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00E1"}),
                commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);
            commandSequence.addReception(nackMessage);
            CommandSequenceProcessor.Process(commandSequence);
            assert(commandSequence.transmission.callback.called);
            assert.equal(1, commandSequence.transmission.callback.firstCall.args.length);
        });

        it('should not call the callback with an error is not callback specified', function(done) {
            var nackMessage = new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00E1"}),
                commandSequence = getCommandSequence({callback: null});

            acknowledgeCommandSequence(commandSequence);
            commandSequence.addReception(nackMessage);
            try {
                CommandSequenceProcessor.Process(commandSequence);
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    describe('Recieving responses', function() {
        it('should call the callback with no error parameter when reaching the correct number of responses', function() {
            var followupMessage = new PlugwiseMessageModel({code: "1234", sequenceNo: "0001", parameters: "SOME-PARAMETERS"}),
                commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);
            CommandSequenceProcessor.Process(commandSequence);

            assert(!commandSequence.transmission.callback.called);

            commandSequence.addReception(followupMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert(commandSequence.transmission.callback.called);
            assert.equal(2, commandSequence.transmission.callback.firstCall.args.length);
            assert.equal(null, commandSequence.transmission.callback.firstCall.args[0]);
        });

        it('should not call the callback with when reaching the correct number of responses if no callback is specified', function(done) {
            var followupMessage = new PlugwiseMessageModel({code: "1234", sequenceNo: "0001", parameters: "SOME-PARAMETERS"}),
                commandSequence = getCommandSequence({callback: null});

            acknowledgeCommandSequence(commandSequence);
            CommandSequenceProcessor.Process(commandSequence);
            commandSequence.addReception(followupMessage);

            try {
                CommandSequenceProcessor.Process(commandSequence);
                done();
            } catch(ex) {
                done(ex);
            }
        });

        it('should call onError when recieving more messages than expected', function() {
            var followupMessage = new PlugwiseMessageModel({code: "1234", sequenceNo: "0001", parameters: "SOME-PARAMETERS"});
                commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);

            CommandSequenceProcessor.Process(commandSequence);
            assert(!commandSequence.transmission.callback.called);

            commandSequence.addReception(followupMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert(commandSequence.transmission.callback.called);
            assert.equal(2, commandSequence.transmission.callback.firstCall.args.length);

            commandSequence.addReception(followupMessage);
            CommandSequenceProcessor.Process(commandSequence);

            assert.equal(2, commandSequence.transmission.callback.callCount);
            assert.equal(1, commandSequence.transmission.callback.secondCall.args.length);
        });

        it('should not call onError when recieving more messages than expected if no callback is specified', function(done) {
            var followupMessage = new PlugwiseMessageModel({code: "1234", sequenceNo: "0001", parameters: "SOME-PARAMETERS"});
                commandSequence = getCommandSequence({callback: null});

            acknowledgeCommandSequence(commandSequence);

            CommandSequenceProcessor.Process(commandSequence);

            commandSequence.addReception(followupMessage);
            try{
                CommandSequenceProcessor.Process(commandSequence);
                commandSequence.addReception(followupMessage);
                CommandSequenceProcessor.Process(commandSequence);
                done();
            } catch(ex) {
                done(ex);
            }

        });

        it('should not call any callbacks if the number of messages received is less than the number of messages expected', function() {
            var commandSequence = getCommandSequence();

            acknowledgeCommandSequence(commandSequence);

            CommandSequenceProcessor.Process(commandSequence);
            assert(!commandSequence.transmission.callback.called);
        });
    });
 });