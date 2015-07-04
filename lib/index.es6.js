/**
 * localStorage persistent storage adapter for Harō
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2015
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/haro-localstorage
 * @version 1.0.3
 */
"use strict";

(function (global) {
	const Promise = global.Promise || require("es6-promise").Promise;
	const localStorage = global.localStorage || require("localStorage");

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
			record = key !== undefined,
			prefix = store.adapters.local || store.id,
			result;

		if (op === "get") {
			if (record) {
				result = localStorage.getItem(prefix + "_" + key);

				if (result !== null) {
					defer.resolve(JSON.parse(result));
				} else {
					defer.reject(new Error("Record not found in localStorage"));
				}
			} else {
				result = localStorage.getItem(prefix);

				if (result !== null) {
					defer.resolve(JSON.parse(result));
				} else {
					defer.resolve([]);
				}
			}
		}

		if (op === "remove") {
			try {
				if (record) {
					localStorage.removeItem(prefix + "_" + key);
				} else {
					localStorage.removeItem(prefix);
				}

				defer.resolve(true);
			} catch (e) {
				defer.reject(e);
			}
		}

		if (op === "set") {
			try {
				if (record) {
					localStorage.setItem(prefix + "_" + key, JSON.stringify(data));
				} else {
					localStorage.setItem(prefix, JSON.stringify(store.toArray()));
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
