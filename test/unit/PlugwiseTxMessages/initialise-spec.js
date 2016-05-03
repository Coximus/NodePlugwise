var assert = require('assert'),
    InitialiseMsg = require('../../../PlugwiseTxMessages/Initialise'),
    PlugwiseMessage = require('../../../PlugwiseMessageModel'),
    Promise = require('bluebird');

describe('PlugwiseTxMessage - Initialise', function() {
    describe('Message Creatiion', function() {
        it('should store a message type of 0', function() {
            var msg = new InitialiseMsg();

            assert.deepEqual(0, msg.type);
        });

        it('should set a message of 000A', function() {
            var msg = new InitialiseMsg();

            assert.equal("\x05\x05\x03\x03000AB43C\x0D\x0A", msg.message);
        });
    });

    describe('Obtaining network data', function() {
        it('should return an object with the network address back through the callback', function(done) {
            var fixtures = getFixtures(),
                promises = getPromisedMessages(fixtures);

            Promise.all(promises).then(function(networkData){
                var i;
                for(i = 0; i < fixtures.length; i++) {
                    assert.equal(fixtures[i].network, networkData[i].network);
                }
                done();
            }).catch(function(e) {
                done(e);
            });
        });

        it('should return an object with the stick address back through the callback', function(done) {
            var fixtures = getFixtures(),
                promises = getPromisedMessages(fixtures);

            Promise.all(promises).then(function(networkData){
                var i;
                for(i = 0; i < fixtures.length; i++) {
                    assert.equal(fixtures[i].stick, networkData[i].stick);
                }
                done();
            }).catch(function(e) {
                done(e);
            });
        });

        it('should return an object with the circlePlus address back through the callback', function(done) {
            var fixtures = getFixtures(),
                promises = getPromisedMessages(fixtures);

            Promise.all(promises).then(function(networkData){
                var i;
                for(i = 0; i < fixtures.length; i++) {
                    assert.equal(fixtures[i].circlePlus, networkData[i].circlePlus);
                }
                done();
            }).catch(function(e) {
                done(e);
            });
        });

        it('should return data from the first recption of type 0011', function(done) {
            var fixtures = getFixtures(),
                promises = [];

            fixtures.forEach(function(fixture) {
                promises.push(new Promise(function(resolve, reject){
                    var receptions = [
                            new PlugwiseMessage({code: '1234'}),
                            new PlugwiseMessage({code: '0011', parameters: fixture.rawMessage})
                        ],
                        msg = new InitialiseMsg(function(error, networkData) {
                            if (error) {
                                console.log('rejecting');
                                reject('error');
                            }
                            resolve(networkData);
                        });

                    msg.callback(null, receptions);
                }));
            });

            Promise.all(promises).then(function(networkData){
                var i;
                for(i = 0; i < fixtures.length; i++) {
                    assert.equal(fixtures[i].circlePlus, networkData[i].circlePlus);
                }
                done();
            }).catch(function(e) {
                done(e);
            });
        });

        function getPromisedMessages(fixtures) {
            var promises = [];

            fixtures.forEach(function(fixture) {
                promises.push(new Promise(function(resolve, reject){
                    var receptions = [new PlugwiseMessage({code: '0011', parameters: fixture.rawMessage})],
                        msg = new InitialiseMsg(function(error, networkData) {
                            resolve(networkData);
                        });

                    msg.callback(null, receptions);
                }));
            });

            return promises;
        }

        function getFixtures(){
            return [{
                network: '000D6F0000',
                stick: '99558D',
                circlePlus: '768D95',
                rawMessage: '000D6F000099558D0101480D6F0000768D955B48FF'
            },{
                network: '000D6F0001',
                stick: '99558E',
                circlePlus: '768D96',
                rawMessage: '000D6F000199558E0101480D6F0000768D965B48FF'
            }];
        }
    });

    describe('Errors', function() {
        it('should pass through an error if one was present when calling process', function(done) {
            var errorMessage = 'There was an error',
                receptions = [new PlugwiseMessage({code: '0011', parameters: '000D6F000099558D0101480D6F0000768D955B48FF'})],
                msg = new InitialiseMsg(function(error, networkData) {
                    assert.equal(errorMessage, error);
                    done();
                });

            msg.callback(errorMessage, receptions);
        });

        it('should pass through an error if no initialisation response was present', function(done) {
            var errorMessage = 'No valid Initialisation Response found.',
                receptions = [new PlugwiseMessage({code: 'incorrect-code', parameters: '000D6F000099558D0101480D6F0000768D955B48FF'})],
                msg = new InitialiseMsg(function(error, networkData) {
                    assert.equal(errorMessage, error);
                    done();
                });

            msg.callback(null, receptions);
        });

        it('should pass through an error if no initialisation response was present with a parameter length of 42', function(done) {
            var errorMessage = 'No valid Initialisation Response found.',
                receptions = [new PlugwiseMessage({code: '0011', parameters: 'incorrect-parameter-length'})],
                msg = new InitialiseMsg(function(error, networkData) {
                    assert.equal(errorMessage, error);
                    done();
                });

            msg.callback(null, receptions);
        });
    });
});