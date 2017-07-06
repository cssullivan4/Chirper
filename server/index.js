var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')
var mysql = require('mysql');

var clientPath = path.join(__dirname, '../client');

var pool = mysql.createPool({ // keeps connection open // speeds up
    connectionLimit: 10,
    host: 'localhost',
    user: 'chirperAdmin',
    password: 'chirptweet',
    database: 'Chirper'
});

//talking to server = downloading front end
var app = express();
app.use(express.static(clientPath));
app.use(bodyParser.json()); // stores on req.body

app.route('/api/chirps')
    .get(function(req, res) {
        rows('getAllChirps')
        .then(function(chirps) {
            res.send(chirps);
        }).catch(function(err) {
            console.log(err);
            res.sendStatus(500);
        });
    }).post(function(req, res) {
        var newChirp = req.body;
        row('createChirp', [newChirp.message, newChirp.userid])
            .then(function(id) {
            res.status(201).send(id);
        }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
    });
app.route('/api/chirps/:id') // route parameter
    .get(function(req, res) {
        row('getOneChirp', [req.params.id]) // params is part of ExpressJS
        .then(function(chirp) {
            res.send(chirp);
        }).catch(function(err) {
            console.log(err);
            res.sendStatus(500);
        });
    }).put(function(req, res) {
        empty('updateChirp', [req.params.id, req.body.message]) // params id unless will available elsewhere, like body // front must match front end is seeing
        .then(function () {
            res.sendStatus(204);
        }).catch(function(err) {
            console.log(err);
            res.sendStatus(500);
        });
    }).delete(function(req, res) {
        empty('deleteChirp', [req.params.id])
        .then(function() {
            res.sendStatus(204);
        }).catch(function(err) {
            console.log(err);
            res.sendStatus(500);
        });
    });


// app.get('/testing', function(req, res) {
//     res.send('it worked');
// });

// app.get('/api/Chirper', function (req, res) {
//     getAllChirps()
//         .then(function (Chirper) {
//             res.send(Chirper);
//         }, function (err) {
//             console.log(err);
//             res.sendStatus(500);
//         });
// });

// app.get('/api/Chirper', function (req, res) {
//     getOneChirp()
//         .then(function (Chirper) {
//             res.send(Chirper);
//         }, function(err) {
//             console.log(err);
//             res.sendStatus(500);
//         });
// });

// app.post('/api/Chirper', function (req, res) {
//     createChirp(req.body.name, req.body.description)
//         .then(function (id) {
//             res.status(201).send(id);
//         }, function (err) {
//             res.status(500).send(err);
//         });
// });

// app.delete('/api/Chirper', function(req, res) {
//     deleteChirp(id)
//     .then(function (id) {
//         res.send(id).status(204);
//     }, function (err) {
//         res.status(500).send(err);
//     })
// });
app.get('/api/users', function(req, res) {
    rows('GetUsers')
    .then(function(users) {
        res.send(users);
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
});

app.listen(3000);


// PROCEDURES

function callProcedure(procedureName, args) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if(err) {
                reject(err);
            } else { 
                // connection proceeding, this helps direct the build
                var placeholders = '';
                if (args && args.length > 0) { // more than 1 item in array
                    for (var i = 0; i < args.length; i++) {
                        if (i === args.length - 1) { // if on last argument in array
                            placeholders += '?'; // last one
                        } else {
                            placeholders += '?,'; // before 
                        }
                    }
                }
                var callString = 'CALL ' + procedureName + '(' + placeholders + ')'; // CALL GetChirps(); or CALL InsertChirp(?, ?, ?);
                connection.query(callString, args, function(err, resultsets) { // args is filling in
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resultsets);
                    }
                });
            }
        });
    });
}

// HOW RETURNING WHAT FROM PROCEDURE
function rows(procedureName, args) { 
    return callProcedure(procedureName, args) // return because know it's a promise so needs to set as promise
        .then(function(resultsets) {
        return resultsets[0]; // plural
        });
}

function row(procedureName, args) { // one specific row
    return callProcedure(procedureName, args)
        .then(function(resultsets) {
            return resultsets[0][0];
        });
}

function empty(procedureName, args) { // when not expecting anything back
    return callProcedure(procedureName, args)
        .then(function() {
            return;
        });
}

// function getAllChirps() {
//     return new Promise(function (resolve, reject) {
//         pool.getConnection(function (err, connection) { // ring ring // callback //
//             if (err) {
//                 reject(err);
//             } else {
//                 connection.query('CALL getAllChirps();', function (err, resultsets) {
//                     connection.release();
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(resultsets[0]); // select statement // additional is item within statement
//                     }
//                 });
//             }
//         });
//     });
// }

// function getOneChirp() {
//     return new Promise(function (resolve, reject) {
//         pool.getConnection(function (err, connection) {
//             if (err) {
//                 reject(err);
//             } else {
//                 connection.query('CALL getOneChirp();', function (err, resultSets) {
//                     connection.release();
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(resultSets[0][0]);
//                     }
//                 });
//             }
//         });
//     });
// }

// function createChirp(description, name) {
//     return new Promise(function (resolve, reject) {
//         pool.getConnection(function (err, connection) {
//             if (err) {
//                 reject(err);
//             } else {
//                 connection.query('CALL createChirp(?,?);', [description, name], function (err, resultSets) {
//                     connection.release();
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(resultSets[0][0]);
//                     }
//                 });
//             }
//         });
//     });
// }

// function updateChirp(description) {
//     return new Promise(function (resolve, reject) {
//         pool.getConnection(function (err, connection) {
//             if (err) {
//                 reject(err);
//             } else {
//                 connection.query('CALL updateChirp(?);', [description], function (err, resultSets) {
//                     connection.release();
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve();
//                     }
//                 });
//             }
//         });
//     });
// }

// function deleteChirp() {
//     return new Promise(function (resolve, reject) {
//         pool.getConnection(function (err, connection) {
//             if (err) {
//                 reject(err);
//             } else {
//                 connection.query('CALL deleteChirp;', function(err, resultSets) {
//                     connection.release();
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve();
//                     }
//                 });
//             }
//         });
//     });
// }