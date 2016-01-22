'use strict';

module.exports.direct = promisifyDirect;
module.exports.indirect = promisifyIndirect;
module.exports.indirectParams = promisifyIndirectParams;

function promisifyDirect(object, method, args) {
	args = Array.from(args || []);
	return new Promise(function(resolve, reject) {
		args.push(function(err, res) {
			if (err) { return reject(err); }
			return resolve(res);
		});
		return method.apply(object, args);
	});
}

function promisifyIndirect(object, method, args) {
	args = Array.from(args || []);
	return function() {
		return new Promise(function(resolve, reject) {
			args.push(function(err, res) {
				if (err) { return reject(err); }
				return resolve(res);
			});
			return method.apply(object, args);
		});
	};
}

function promisifyIndirectParams(method, args) {
	args = Array.from(args || []);
	return function(object) {
		return new Promise(function(resolve, reject) {
			args.push(function(err, res) {
				if (err) { return reject(err); }
				return resolve(res);
			});
			return object[method].apply(object, args);
		});
	};
}