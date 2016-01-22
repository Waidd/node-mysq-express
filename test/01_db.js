'use strict';

const fs = require('fs');
require.extensions['.sql'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

const database = require('../lib/node-mysql-express');
const schema = require('./schema.sql');

describe('Database connection', function() {
	describe('Initialization', function() {
		it ('create pool', function() {
			let	options = {
				multipleStatements 	: true,
				connectionLimit		: 10,
				host 				: process.env.MYSQL_HOST || 'localhost',
				port 				: process.env.MYSQL_PORT || '3306',
				database 			: process.env.MYSQL_DATABASE || 'node_mysql_express',
				user 				: process.env.MYSQL_USER || 'root',
				password 			: process.env.MYSQL_PASSWORD || ''
			};
			database.createPool(options, { traceConnections: true });
		});
		it ('ping db', function(done) {
			database.pool.ping()
			.then(() => done())
			.catch((err) => done(err));
		});
	});

	describe('Structure schema', function() {
		let connection;

		it ('establish connection', function(done) {
			connection = new database.connection(database.pool);
			connection.getConnection().then(() => done())
			.catch((err) => done(err));
		});
		it('structure test DB', function(done) {
			connection.query(schema)
			.then(() => done())
			.catch((err) => done(err));
		});
		it('truncate test DB', function (done) {
			let sql = `
				SET FOREIGN_KEY_CHECKS=0;
				TRUNCATE users_commons;
				TRUNCATE commons;
				TRUNCATE things;
				TRUNCATE users;
				SET FOREIGN_KEY_CHECKS=1;
			`;
			connection.query(sql)
			.then(() => done())
			.catch((err) => done(err));
		});
		it('close connection', function() {
			connection.release();
		});
	});
});