/*global require*/
var nano = require('nano')('http://localhost:5984'),
    dbName = 'myplantandme',
    db = nano.use(dbName),

    designDocument = require('./db_design.json');

function log(docId) {
    console.log("Create document " + docId + " into database " + dbName + ".");
}

function logAlreadyExists(docId) {
    console.log("Document " + docId + " already exists in database " + dbName + ".");
}

function createDesignDocument() {
    db.insert(designDocument, function(err, body) {
        if (!err) {
            log(designDocument._id);
        } else if (err.statusCode === 409) {
            logAlreadyExists(designDocument._id);
        } else {
            throw err;
        }
    });
}

createDesignDocument();
