# Node Plugwise
A Node module to interact with Plugwise equipment

## Installation

via [npm (node package manager)](http://github.com/isaacs/npm)

    $ npm install NodePlugwise

## Usage

    var Plugwise = require('NodePlugwise'),
        express = require('express'),
        app = express();

    Plugwise.connect('/dev/serial-port', function(error, plugwise) {
        if(error) { return console.error(error) }
        // @Params Plug-Address, desired state (1 = on, 0 = off), callabck
        Plugwise.switchPlug('000D6F0000768D95', 1, function(error, response) {
            if (error) {
                return console.error(error);
            }
            console.log("Success", response);
        });
    });

See https://github.com/Coximus/NodePlugwiseAPI as work in progress example of a RESTFul API using Express to expose NodePlugwise through a web interface

## Features

As this is the first release the features are limited to the following:

* Connecting to the Plugwise Stick
* Switching Plugwise Circles/Circle+ on/off

## Documentation

See http://paul-alcock.co.uk/node-plugwise
