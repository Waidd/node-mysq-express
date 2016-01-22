'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('../../lib/node-mysql-express');

const routes = require('./routes');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mysql.middleware());
app.use(routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send({ message: err.message, err: err.name, stack: err.stack });
});

module.exports = app;
