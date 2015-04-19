/*jshint esnext: true*/
/*global require, module*/
var emitter;

var colors = require('colors/safe'),
    nano = require('nano')('http://localhost:5984'),
    dbName = 'myplantandme',
    db = nano.use(dbName);

nano.db.create(dbName, function(err, body) {
    if (err && err.statusCode !== 412) {
        throw err;
    }
});

var csp = require('js-csp'),
    bodyParser = require('body-parser'),
    express = require('express'),
    app = express();

app.use(bodyParser.urlencoded({extended: true}));

// Routes
app.get('/temp', function(req, res) {
    csp.go(function*() {
        var t = yield getTemp();
        res.send(t);
    });
});

app.get('/luminosity', function(req, res) {
    csp.go(function*() {
        var l = yield getLuminosity();
        res.send(l);
    });
});

app.get('/humidity', function(req, res) {
    csp.go(function*() {
        var h = yield getHumidity();
        res.send(h);
    });
});

/**
* Params :
* - duration: timestamp (seconds)
*/
app.post('/actions/lights', function(req, res) {
    emitter.emit('clientAction', res, 'lights', req.body.duration);
});

/**
* Params :
* - duration: timestamp (seconds)
*/
app.post('/actions/fan', function(req, res) {
    emitter.emit('clientAction', res,  'fan', req.body.duration);
});

/**
* Params :
* - duration: timestamp (seconds)
*/
app.post('/actions/water', function(req, res) {
    emitter.emit('clientAction', res, 'water', req.body.duration);
});

// Setup
module.exports.create = function create(eventEmitter, host, port) {
    emitter = eventEmitter;
    return app.listen(port, host, function() {
        log('Server listening to http://' + host + ':' + port);
    });
};

// Helpers
function log(s) {
    console.log(colors.cyan('Web  ', new Date(), '  ', s));
}

// Read from db
function fetchView(viewName) {
    var ch = csp.chan();
    db.view('sensors', viewName, function(err, body) {
        if (err) {
            throw err;
        }
        csp.putAsync(ch, {
            history: body.rows.map(function(doc) {
                doc.value.date = toTime(doc.value.date);
                return doc.value;
            })
        });
    });
    return ch;
}

function toTime(dateString) {
    var date = new Date(dateString);
    if (date.getTime) {
        return date.getTime();
    } else {
        return undefined;
    }
}

function getTemp() {
    return csp.go(function*() {
        return (yield fetchView('tempByDate'));
    });
}

function getLuminosity() {
    return csp.go(function*() {
        return (yield fetchView('luminosityByDate'));
    });
}

function getHumidity() {
    return csp.go(function*() {
        return (yield fetchView('humidityByDate'));
    });
}
