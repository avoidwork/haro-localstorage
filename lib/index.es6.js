/**
 * localStorage persistent storage adapter for Harō
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2015
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/haro-localstorage
 * @version 1.0.7
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

	function adapter (store, op, key, data) {
		let defer = deferred(),
			record = key !== undefined,
			prefix = store.adapters.local || store.id,
			lkey = prefix + (record ? "_" + key : ""),
			result;

		if (op === "get") {
			result = localStorage.getItem(lkey);

			if (result !== null) {
				defer.resolve(JSON.parse(result));
			} else if (record) {
				defer.reject(new Error("Record not found in localStorage"));
			} else {
				defer.resolve([]);
			}
		} else if (op === "remove") {
			localStorage.removeItem(lkey);
			defer.resolve(true);
		} else if (op === "set") {
			try {
				localStorage.setItem(lkey, JSON.stringify(record ? data : store.toArray()));
				defer.resolve(true);
			} catch (e) {
				defer.reject(e);
			}
		}

		return defer.promise;
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = adapter;
	} else if (typeof define === "function") {
		define(function () {
			return adapter;
		});
	} else {
		global.haroLocalStorage = adapter;
	}
}(typeof global !== "undefined" ? global : window));
