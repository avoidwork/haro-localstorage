var adapter = require("../lib/index.js"),
	haro = require("haro"),
	localStorage = require("localStorage"),
	data = [{guid: "abc", yay: true}, {guid: "def", yay: false}],
	config = {key: "guid", logging: false, adapters: {local: "nodeunit"}};

function clone (arg) {
	return JSON.parse(JSON.stringify(arg));
}

exports["load - datastore"] = {
	setUp: function (done) {
		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register('local', adapter);
		this.key = this.store.adapters.local;
		this.localStorage.setItem(this.key, JSON.stringify(this.data));
		done();
	},
	test: function (test) {
		var self = this,
			result = JSON.parse(this.localStorage.getItem(this.key));

		test.expect(3);
		test.equal(this.store.total, 0, "Should be 0");
		test.equal(result.length, 2, "Should be 2");
		this.store.load('local').then(function () {
			test.equal(self.store.total, 2, "Should be 2");
			test.done();
		}, function () {
			test.done();
		});
	}
};

exports["load - record"] = {
	setUp: function (done) {
		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register('local', adapter);
		this.key = this.store.adapters.local + "_" + this.data[0];
		this.localStorage.setItem(this.key, JSON.stringify(this.data[0]));
		done();
	},
	test: function (test) {
		var self = this,
			result = JSON.parse(this.localStorage.getItem(this.key));

		test.expect(3);
		test.equal(this.store.total, 0, "Should be 0");
		test.equal(result.guid, this.data[0].guid, "Should match");
		this.store.load('local', result.guid).then(function () {
			test.equal(self.store.total, 1, "Should be 1");
			test.done();
		}, function () {
			test.done();
		});
	}
};