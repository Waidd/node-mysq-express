'use strict';

const Users = require('../models/users');

module.exports.create = create;

function create(req, res, next) {
	if (typeof req.body.username === 'undefined' || req.body.username === '')
	{
		let err = new Error('Missing username.'); err.status = 400;
		return next(err);
	}

	Users.create(req.connection, req.body.username)
	.then(() => res.sendStatus(200))
	.catch((err) => next(err));
}

