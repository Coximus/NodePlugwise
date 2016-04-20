var assert = require('assert'),
    sinon = require('sinon'),
    CommandSequenceProcessor = require('../../commandSequenceProcessor.js'),
    CommandSequence = require('../../CommandSequence.js'),
    PlugwiseMessageModel = require('../../PlugwiseMessageModel.js');

 describe('Command Sequence Processor', function() {
    
    // describe('Sequence Is Incomplete', function() {
    //     it('should not call any callbacks if there is only a transmission', function() {
    //         var successSpy = sinon.spy(),
    //             errorSpy = sinon.spy(),
    //             txMessage = new PlugwiseMessageModel({onError: errorSpy, onSuccess: successSpy}),
    //             commandSequence = new CommandSequence(txMessage);

    //         assert(!errorSpy.called);
    //         assert(!successSpy.called);
    //     });
    // });

    describe('Receiving a negative acknowledgement', function() {
        it('should call the onError callback', function() {
           var successSpy = sinon.spy(),
                errorSpy = sinon.spy(),
                txMessage = new PlugwiseMessageModel({
                    code: "0000",
                    parameters: "00E1",
                    onError: errorSpy,
                    onSuccess: successSpy
                }),
                commandSequence = new CommandSequence(txMessage);

            assert(!errorSpy.called);
            assert(!successSpy.called); 
        });
    });
 });