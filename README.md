# Node Plugwise
A Node module to interact with Plugwise equipment

## Installation

via [npm (node package manager)](http://github.com/isaacs/npm)

    $ npm install node-plugwise

## Usage

    var Plugwise = require('node-plugwise'),
        plugwise = new Plugwise();
        plugwise.connect('/dev/your-serial', function() {
        plugwise.switchPlug("000D6F0000768D95", 0, function(error, response) {
            console.log(error, response);
        });
    });

## Features

As this is the first release the features are limited to the following:

* Connecting to the Plugwise Stick
* Switching Plugwise Circles/Circle+ on/off

## Documentation

See http://paul-alcock.co.uk/node-plugwise
