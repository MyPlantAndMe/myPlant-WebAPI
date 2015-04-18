/*jshint esnext: true*/
/*global require*/
var nano = require('nano')('http://localhost:5984'),
    dbName = 'myplantandme',
    db = nano.use(dbName);

nano.db.create(dbName, function(err, body) {
    if (err && err.statusCode !== 412) {
        throw err;
    }
});

var csp = require('js-csp'),
    express = require('express'),
    app = express(),
    server = app.listen(3000, 'localhost', serve);

//
// Routes
//
app.get('/', function(req, res) {
    res.send('Hello from server');
});

app.get('/temp', function(req, res) {
    csp.go(function*() {
        var t = yield getTemp();
        res.send(t);
    });
});

//
// Setup
//
function serve() {
    var host = server.address().address,
        port = server.address().port;
    console.log('Server listening to http://%s:%s', host, port);
}

//
// Read from db
//
function fetchView(viewName) {
    var ch = csp.chan();
    db.view('sensors', viewName, function(err, body) {
        if (err) {
            throw err;
        }
        csp.putAsync(ch, body.rows.map(function(doc) {
            return doc.value;
        }));
    });
    return ch;
}

function getTemp() {
    return csp.go(function*() {
        return (yield fetchView('tempByDate'));
    });
}
