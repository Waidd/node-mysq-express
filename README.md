# mysql express wrapper

Just a simple [Express](http://expressjs.com/) middleware for [node-mysql](https://github.com/felixge/node-mysql).

## Notes

Immediate TODOs: 
* More tests
* Better documentation

## Requirements

- node >= 5.0.0

## Installation

```bash
npm install https://github.com/Waidd/node-mysql-express.git --save
```

Or add it to your package.json

## Usage

### Initialization

```javascript
const express = require('express');
const mysql = require('node-mysql-express');
const routes = require('./routes');
const app = express();

// options for node-mysql pool
let poolOptions = {
	connectionLimit	: 10,
	host 			: 'localhost',
	port 			: '3306',
	database 		: 'node_mysql_express',
	user 			: 'root',
	password 		: ''
};
let wrapperOptions = {
	traceConnections: true
};
mysql.createPool(poolOptions, wrapperOptions);

//set middleware for mysql
app.use(mysql.middleware());
app.use(routes);
```

Options for [node-mysql pool](https://github.com/felixge/node-mysql#pool-options).

### Use in route

```javascript
function create_with_query(req, res, next) {
	req.connection.query('INSERT INTO users SET username=?)', [req.body.username])
	.then((res) => res.send(res.insertId)
    .catch((err) => next(err));
}

// query2 escape query using tagged template strings
function get_with_query2(req, res, next) {
	req.connection.query2`SELECT * FROM users WHERE username=${req.body.username}`
	.then((res) => res.send(res[0])
    .catch((err) => next(err));
}
```

[Tagged template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings)

### Transaction support

```javascript
function create_with_transaction(req, res, next) {
	req.connection.beginTransaction()
    .then(() => req.connection.query2`INSERT INTO users SET username=${req.body.username}`)
    .then(() => req.connection.commit())
    .then(() => res.sendStatus(200))
    .catch((err) => req.connection.rollback().then(() => next(err)))
    .catch((err) => {
	    //rollback failed 
        next(err);
    })
}
```

### Connection release

Connections are automatically released on express res finish event :

```javascript
res.on('finish', function() { if (!req.connection.keepAlive) { req.connection.release(); } });
```

You can set `req.connection.keepAlive` to `true` if you need to use the connection after `res.send()`.

If you do this, you must manually release the connection when you are done : `req.connection.release()`.


## Change Log

* Initial release

## Tests

	$ mysql -u root -e "DROP DATABASE IF EXISTS node_mysql_express"
	$ mysql -u root -e "CREATE DATABASE IF NOT EXISTS node_mysql_express"
	$ MYSQL_HOST=localhost MYSQL_PORT=3306 MYSQL_DATABASE=node_mysql_express MYSQL_USER=root MYSQL_PASSWORD= npm test

## License

The MIT License (MIT)

Copyright (c) 2016 Thomas Cholley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


