'use strict';

const express = require('express');
const router = express.Router();
const usersController = require('./controllers/users');

router.route('/users')
	.post(usersController.create);

module.exports = router;
