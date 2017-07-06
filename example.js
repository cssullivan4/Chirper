var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var pool = mysql.createPool({ // object literal as parameter // slide 15
    connectionLimit: 10,
    host: 'localhost',
    user: 'exampleUser1',
    password: 'password',
    database: 'InClassExample'
});

var app = express(); // need to create // is this API? // why necessary again?
app.use(bodyParser.json()); // want you to use body-parser to put into json please // why?

app.get('/api/courses', function (req, res) { // wanting list of courses
    getCourses() // duh so easy because just wrote to get array
        .then(function (courses) {
            res.send(courses); // does a lot including set content type to .JSON
        }, function (err) {
            console.log(err);
            res.sendStatus(500);
        });
});

app.post('/api/courses', function (req, res) { // expecting to save new post to system
    // body-parser
    // instruction // console.log(req.body); // collects incoming json, parses into object, sets into body
    insertCourse(req.body.name, req.body.description)
        .then(function (id) { // later we resolve select statement into id // remember: SELECT: LAST ID in mysql // so post that data here //
            res.status(201).send(id); // status is assurance that "hey yes created" // that's why added // REST!
        }, function (err) {
            console.log(err);
            res.sendStatus(500);
        })
})

app.listen(3000);



function getCourses() {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                connection.query('CALL GetCourses();', function (err, resultsets) {
                    connection.release(); // no matter what happens, need to release connection
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resultsets[0]); // referring to which SELECT statement // add [0] to choose first item within first Course from array // etc if have additional arrays
                    }
                })
            }
        });
    });
}

function insertCourse(name, description) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                // parameterValues = [name, description]; // for variable sub
                connection.query('CALL InsertCourse(?,?);', [name, description], /* parameterValues, */ function (err, resultsets) {
                    connection.release(); // will always need release with connection function
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resultsets[0][0]); // second [] now returns object instead of just array // refer to postman with post & see bottom preview
                    }
                })
            }
        })
    })
}