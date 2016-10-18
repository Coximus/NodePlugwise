var assert = require('assert'),
    sinon = require('sinon'),
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

    describe('Timer', function() {
        it('should start a timer when invoking the startTimer method', function() {
            var commandSequence = new CommandSequence();

            commandSequence.startTimer(function(){});
            assert.notDeepEqual(undefined, commandSequence.timer);
        });

        it('should call the callback when the timer expires', function(done) {
            process.env.NODE_ENV = 'test';
            var commandSequence = new CommandSequence(),
                callback = sinon.spy();

            commandSequence.startTimer(callback);

            setTimeout(function() {
                assert.equal(1, callback.callCount);
                done();
            },15);
        });

        it('should call the callback passing itself as a parameter when the timer expires', function(done) {
            process.env.NODE_ENV = 'test';
            var commandSequence = new CommandSequence(),
                callback = sinon.spy();

            commandSequence.startTimer(callback);

            setTimeout(function() {
                assert.equal(1, callback.callCount);
                assert.equal(commandSequence, callback.firstCall.args[0]);
                done();
            },15);
        });

        it('should stop the timer when calling the stopTimer method', function(done) {
            process.env.NODE_ENV = 'test';
            var commandSequence = new CommandSequence(),
                callback = sinon.spy();

            commandSequence.startTimer(callback);
            commandSequence.stopTimer();

            setTimeout(function() {
                assert.equal(0, callback.callCount);
                done();
            },15);
        });

        it('should restart the timer when the resetTimer method is called', function(done) {
            process.env.NODE_ENV = 'test';
            var commandSequence = new CommandSequence(),
                callback = sinon.spy();

            commandSequence.startTimer(callback);
            var firstTtimer = commandSequence.timer._idleStart;
            setTimeout(function() {
                commandSequence.resetTimer();
                assert.ok(commandSequence.timer._idleStart > firstTtimer);
                done();
            }, 5);
        });

        it('should call the callback when a timer expires even after it has been reset', function(done) {
            process.env.NODE_ENV = 'test';
            var commandSequence = new CommandSequence(),
                callback = sinon.spy();

            commandSequence.startTimer(callback);
            commandSequence.resetTimer();
            setTimeout(function() {
                assert.equal(1, callback.callCount);
                assert.equal(commandSequence, callback.firstCall.args[0]);
                done();
            }, 15);
        });

        it('should reset its timer when recieving a message', function() {
            var commandSequence = new CommandSequence(),
                messages = [new PlugwiseMessageModel({code: "0000", sequenceNo: "0001", parameters: "00C1"}),
                    new PlugwiseMessageModel({code: "0001", sequenceNo: "0001", parameters: "00C1"})];

            sinon.spy(commandSequence, 'resetTimer');
            messages.forEach(function(message, index) {
                commandSequence.addReception(message);
                assert.equal(index+1, commandSequence.resetTimer.callCount);
            });
        });
    });
});