"use strict";

(function (global) {
	const Promise = global.Promise || require("es6-promise").Promise;

	function deferred () {
		let promise, resolver, rejecter;

		promise = new Promise(function (resolve, reject) {
			resolver = resolve;
			rejecter = reject;
		});

		return {resolve: resolver, reject: rejecter, promise: promise};
	}

	function local (store, op, key, data) {
		let defer = deferred(),
			record = key !== undefined && store.has(key),
			prefix = store.adapters.local,
			result;

		if (op === "get") {
			if (record) {
				result = localStorage.getItem(prefix + "_" + store.id + "_" + key);

				if (result !== null) {
					result = JSON.parse(result);
					store.set(key, result, true).then(function (rec) {
						defer.resolve(rec);
					}, function (e) {
						defer.reject(e);
					});
				} else {
					defer.reject(new Error("Record not found in localStorage"));
				}

				store.set(key, result, true).then(function (rec) {
					defer.resolve(rec);
				}, function (e) {
					defer.reject(e);
				});
			} else {
				result = localStorage.getItem(prefix + "_" + store.id);

				if (result !== null) {
					result = JSON.parse(result);
					store.batch(result, "set").then(function (args) {
						defer.resolve(args);
					}, function (e) {
						defer.reject(e);
					});
				} else {
					defer.resolve([]);
				}
			}
		}

		if (op === "remove") {
			try {
				if (record) {
					localStorage.removeItem(prefix + "_" + store.id + "_" + key);
				} else {
					localStorage.removeItem(prefix + "_" + store.id);
				}

				defer.resolve(true);
			} catch (e) {
				defer.reject(e);
			}
		}

		if (op === "set") {
			try {
				if (record) {
					localStorage.setItem(prefix + "_" + store.id + "_" + key, JSON.stringify(data));
				} else {
					localStorage.setItem(prefix + "_" + store.id, JSON.stringify(store.toArray()));
				}

				defer.resolve(true);
			} catch (e) {
				defer.reject(e);
			}
		}

		return defer.promise;
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = local;
	} else if (typeof define === "function") {
		define(function () {
			return local;
		});
	} else {
		global.haroLocal = local;
	}
}(typeof global !== "undefined" ? global : window));
