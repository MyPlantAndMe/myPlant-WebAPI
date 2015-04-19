/*jshint esnext: true*/
/*global require, module*/
var net = require('net'),
    colors = require('colors/safe');

// TCP server for server <—> RaspberryPi communication
module.exports.create = function create(emitter, host, port) {
    return net.createServer(function(socket) {
        log('client connected');

        socket.on('end', function() {
            emitter.removeListener('clientAction',
                                   handleClientAction.bind(this, socket));
            log('client disconnected');
        });

        emitter.on('clientAction', handleClientAction.bind(this, socket));

    }).listen(port, host, function() {
        log('Server listening to ' + host + ' ' + port);
    });
};

function handleClientAction(socket, sensor, duration) {
    socket.write(JSON.stringify({sensor: sensor, duration: duration}));
}

//
// Helpers
//
function log(s) {
    console.log(colors.magenta('TCP  ', new Date(), '  ', s));
}
