/*global require*/
var events = require('events'),
    emitter = new events.EventEmitter(),
    serverTCP = require('./serverTCP')
        .create(emitter, '127.0.0.1', 3100),
    serverWeb = require('./serverWeb.js')
        .create(emitter, '0.0.0.0', 3000);
