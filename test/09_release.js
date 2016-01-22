'use strict';

const database = require('../lib/node-mysql-express');
const util = require('util');

describe('Release', function() {
	it('Check if all db connections are released', function() {
		let open = Object.keys(database.pool.openConnections).length;
		if (open > 0) { throw new Error(open + ' connections still open.\n' + util.inspect(database.pool.openConnections)); }
	});
});