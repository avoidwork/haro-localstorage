/**
 * localStorage persistent storage adapter for Harō
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2015
 * @license BSD-3-Clause
 * @link https://github.com/avoidwork/haro-localstorage
 * @version 1.1.3
 */
"use strict";

(function (global) {
	const deferred = global.deferred || require("tiny-defer");
	const localStorage = global.localStorage || require("localStorage");

	function keys (prefix) {
		var regex = new RegExp("^" + prefix + "_");

		return Object.keys(localStorage).filter(function (i) {
			return regex.test(i);
		});
	}

	function adapter (store, op, key, data) {
		let defer = deferred(),
			record = key !== undefined,
			prefix = store.adapters.local || store.id,
			lkey = prefix + "_" + key,
			result;

		if (op === "get") {
			if (record) {
				result = localStorage.getItem(lkey);
			} else {
				result = keys(prefix).map(function (i) {
					return JSON.parse(localStorage.getItem(i));
				});
			}

			if (result !== null) {
				defer.resolve(typeof result === "string" ? JSON.parse(result) : result);
			} else if (record) {
				defer.reject(new Error("Record not found in localStorage"));
			} else {
				defer.resolve([]);
			}
		} else if (op === "remove") {
			if (record) {
				localStorage.removeItem(lkey);
			} else {
				keys(prefix).forEach(function (i) {
					localStorage.removeItem(i);
				});
			}

			defer.resolve(true);
		} else if (op === "set") {
			if (record) {
				localStorage.setItem(lkey, JSON.stringify(data));
			} else {
				store.toArray().forEach(function (i) {
					localStorage.setItem(prefix + "_" + i[store.key], JSON.stringify(i));
				});
			}

			defer.resolve(true);
		}

		return defer.promise;
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = adapter;
	} else if (typeof define === "function" && define.amd) {
		define(function () {
			return adapter;
		});
	} else {
		global.haroLocalStorage = adapter;
	}
}(typeof window !== "undefined" ? window : global));
