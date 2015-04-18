/*global require*/
var express = require('express'),
    app = express(),
    server = app.listen(3000, 'localhost', serve);

function serve() {
    var host = server.address().address,
        port = server.address().port;
    console.log('Server listening to http://%s:%s', host, port);
}

app.get('/', function(req, res) {
    res.send('Hello from server');
});
