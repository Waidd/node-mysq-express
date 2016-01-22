'use strict';

const MySQL = require('mysql');
const Promisify = require('./promisify');

class MySQLPool {
	constructor(poolOptions, options) {
		this.pool = null;
		this.poolOptions = poolOptions;
		this.options = options || { traceConnections: false };

		this.indexConnection = 0;
		this.openConnections = {};
	}

	create() { this.pool = MySQL.createPool(this.poolOptions); }

	ping() {
		let connection;
		return Promisify.direct(this.pool, this.pool.getConnection)
		.then((_connection) => Promisify.direct(connection = _connection, connection.ping))
		.then(() => connection.release());
	}
}

class MySQLConnection {
	constructor(pool) {
		this.pool = pool instanceof MySQLPool ? pool : { indexConnection: 0, openConnections: {}, pool: pool, options: {} };
		this.connection = null;
		this.keepAlive = false;
	}

	getConnection() {
		if (this.connection !== null) { return Promise.resolve(this.connection); }

		if (this.pool.options.traceConnections) {
			let e = new Error('dummy');
	  		let stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n');
	  		this.indexConnection = this.pool.indexConnection++;
			this.pool.openConnections[this.indexConnection] = stack;
		}

		return Promisify.direct(this.pool.pool, this.pool.pool.getConnection)
		.then(connection => {
			this.connection = connection;
			return this.connection;
		});
	}

	release() {
		if (this.connection === null) { return; }
		
		this.connection.release();
		
		if (this.pool.options.traceConnections) {
			delete this.pool.openConnections[this.indexConnection];
		}
	}

	query2() { return this.getConnection().then(Promisify.indirectParams('query', [SQL(...arguments)])) }
	query() { return this.getConnection().then(Promisify.indirectParams('query', arguments)); }
	beginTransaction() { return this.getConnection().then(Promisify.indirectParams('beginTransaction', arguments)); }
	commit() { return this.getConnection().then(Promisify.indirectParams('commit', arguments)); }
	rollback() { return this.getConnection().then(Promisify.indirectParams('rollback', arguments)); }
}

module.exports.pool = null;
module.exports.connection = MySQLConnection;

module.exports.createPool = createPool;
module.exports.middleware = middleware;
module.exports.SQL = SQL;

function createPool(poolOptions, options) {
	module.exports.pool = new MySQLPool(poolOptions, options);
	module.exports.pool.create();
}

function SQL(str) {
	return str.reduce((prev, each, index) => prev + each + ((index + 1) < arguments.length ? MySQL.escape(arguments[index + 1]) : ''), '');
}

function middleware() {
	return function(req, res, next) {
		req.connection = new MySQLConnection(module.exports.pool);
		res.on('finish', function() { if (!req.connection.keepAlive) { req.connection.release(); } });
		next();
	};
}