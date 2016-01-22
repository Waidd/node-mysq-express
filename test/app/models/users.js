'use strict';

module.exports.create = create;

function create(connection, username) {
	return connection.query2`INSERT INTO users SET username=${username}`
	.then((res) => res.insertId);
}