'use strict';

require('should-http');
const request = require('supertest');
const app = require('./app/app');

describe('Users', function() {
	let users1 = {
		username: 'test1'
	};

	describe('create', function() {
		it ('users1', function(done) {
			request(app)
			.post('/users')
			.send(users1)
			.expect(200, done);
		});
	});
});
