var assert = require('assert'),
    app = require('../../../index.js'),
    sinon = require('sinon'),
    Plugwise = require('../../../Plugwise');

describe('Integration - Plugwise - Switch Plug', function() {

    var plugwiseInstance,
        switchPlugStub;

    beforeEach(function() {
        plugwiseInstance = new Plugwise();
        plugwiseInstance.connected = true;
        sinon.stub(Plugwise, 'getInstance', function() {return plugwiseInstance});
        stubConnect();
    });

    afterEach(function() {
        if(plugwiseInstance.switchPlug.restore) {
            plugwiseInstance.switchPlug.restore();
        }
        if(Plugwise.getInstance.restore) {
            Plugwise.getInstance.restore();
        }
    });

    var stubConnect = function(callbackValue) {
        return sinon.stub(plugwiseInstance, 'connect', function(serial, callback) {
            callback(callbackValue);
        });
    }

    var stubSwitchPlug = function(callbackError, callbackSuccess) {
        return sinon.stub(plugwiseInstance, 'switchPlug').callsArgWith(2, callbackError, callbackSuccess);
    }

    it('should not call the Plugwise switch plug command if plugwise is not connected', function(done) {
        var serial = 'some-serial',
            switchPlugStub = stubSwitchPlug();

        plugwiseInstance.connected = false;

        app.connect('serial', function(error) {
            app.switchPlug('plug-id', 0, function(error, response) {
                assert.deepEqual(0, plugwiseInstance.switchPlug.callCount);
                done();
            });
        });
    });

    it('should call the callback with an error if plugwise is not connected', function(done) {
        var serial = 'some-serial',
            switchPlugStub = stubSwitchPlug();

        plugwiseInstance.connected = false;

        app.connect('serial', function(error) {
            app.switchPlug('plug-id', 0, function(error, response) {
                assert.deepEqual(0, plugwiseInstance.switchPlug.callCount);
                assert.equal('Plugwise not connected', error);
                done();
            });
        });
    });

    it('should call plugwise.switchPlug with the correct parameters', function(done) {
        var serial = 'some-serial',
            switchPlugStub = stubSwitchPlug();

        app.connect('serial', function(error) {
            app.switchPlug('plug-id', 0, function(error, response) {
                assert.deepEqual(1, plugwiseInstance.switchPlug.callCount);
                assert.deepEqual('plug-id', plugwiseInstance.switchPlug.firstCall.args[0]);
                assert.deepEqual(0, plugwiseInstance.switchPlug.firstCall.args[1]);
                done();
            });
        });
    });

    it('should call the callback with an error if plugwise.swichplug returned an error', function(done) {
        var serial = 'some-serial',
            switchPlugStub = stubSwitchPlug(['there was an error']);

        app.connect('serial', function(error) {
            app.switchPlug('plug-id', 0, function(error, response) {
                assert.equal('there was an error', error);
                done();
            });
        });
    });

    it('should call the callback with no error if plugwise.swichplug did not returned an error', function(done) {
        var serial = 'some-serial',
            switchPlugStub = stubSwitchPlug(null, 'success');

        app.connect('serial', function(error) {
            app.switchPlug('plug-id', 0, function(error, response) {
                assert.deepEqual(null, error);
                done();
            });
        });
    });

    it('should call the callback with the object passed by plugwise.swichplug if it was a success', function(done) {
        var serial = 'some-serial',
            successObj = {state: 'success'},
            switchPlugStub = stubSwitchPlug(null, successObj);

        app.connect('serial', function(error) {
            app.switchPlug('plug-id', 0, function(error, response) {
                assert.deepEqual(successObj, response);
                done();
            });
        });
    });
});