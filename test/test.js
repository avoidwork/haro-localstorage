var adapter = require("../lib/index.js"),
	haro = require("haro"),
	localStorage = require("localStorage"),
	data = [{guid: "abc", yay: true}, {guid: "def", yay: false}],
	config = {key: "guid", logging: false, adapters: {local: "nodeunit"}, versioning: false};

function clone (arg) {
	return JSON.parse(JSON.stringify(arg));
}

exports["get - datastore"] = {
	setUp: function (done) {
		var self = this;

		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register("local", adapter);
		this.key = this.store.adapters.local;
		this.data.forEach(function (i) {
			self.localStorage.setItem(self.key + "_" + i[self.store.key], JSON.stringify(i));
		});
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		test.equal(this.store.total, 0, "Should be 0");
		this.store.load("local").then(function () {
			test.equal(self.store.total, 2, "Should be 2");
			test.done();
		}, function () {
			test.done();
		});
	}
};

exports["get - record"] = {
	setUp: function (done) {
		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register("local", adapter);
		this.key = this.store.adapters.local + "_" + this.data[0].guid;
		this.localStorage.setItem(this.key, JSON.stringify(this.data[0]));
		done();
	},
	test: function (test) {
		var self = this,
			result = JSON.parse(this.localStorage.getItem(this.key));

		test.expect(3);
		test.equal(this.store.total, 0, "Should be 0");
		test.equal(result.guid, this.data[0].guid, "Should match");
		this.store.load("local", result.guid).then(function () {
			test.equal(self.store.total, 1, "Should be 1");
			return self.store.unload("local");
		}, function () {
			test.done();
		}).then(function () {
			test.done();
		}, function () {
			test.done();
		});
	}
};

exports["set - datastore"] = {
	setUp: function (done) {
		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register("local", adapter);
		this.key = this.store.adapters.local;
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		test.equal(this.store.total, 0, "Should be 0");
		this.store.batch(this.data, "set").then(function () {
			test.equal(self.store.total, 2, "Should be 2");
			return self.store.save("local");
		}, function () {
			self.store.unload("local");
			test.done();
		}).then(function () {
			var ldata = self.store.toArray().map(function (i) {
				return JSON.parse(localStorage.getItem(self.key + "_" + i.guid));
			});

			test.equal(JSON.stringify(self.store.toArray()), JSON.stringify(ldata), "Should match");
			return self.store.unload("local");
		}, function () {
			test.done();
		}).then(function () {
			test.done();
		}, function () {
			test.done();
		});
	}
};

exports["set - record"] = {
	setUp: function (done) {
		var self = this;

		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register("local", adapter);
		this.key = this.store.adapters.local;
		this.data.forEach(function (i) {
			self.localStorage.setItem(self.key + "_" + i[self.store.key], JSON.stringify(i));
		});
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(5);
		test.equal(this.store.total, 0, "Should be 0");
		this.store.load("local").then(function () {
			test.equal(self.store.total, 2, "Should be 2");
			return self.store.set(null, {guid: "ghi", yay: true});
		}, function () {
			test.done();
		}).then(function (arg) {
			var record = JSON.parse(self.localStorage.getItem(self.key + "_" + arg[0]));

			test.equal(self.store.total, 3, "Should be 3");
			test.equal(arg[0], record.guid, "Should match");
			test.equal(self.store.limit(1, 2)[0][0], record.guid, "Should match");
			return self.store.unload("local");
		}, function () {
			test.done();
		}).then(function () {
			test.done();
		}, function () {
			test.done();
		});
	}
};

exports["remove - datastore"] = {
	setUp: function (done) {
		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register("local", adapter);
		this.key = this.store.adapters.local;
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		test.equal(this.store.total, 0, "Should be 0");
		this.store.batch(this.data, "set").then(function () {
			test.equal(self.store.total, 2, "Should be 2");
			return self.store.save("local");
		}, function () {
			test.done();
		}).then(function () {
			return self.store.unload("local");
		}, function () {
			test.done();
		}).then(function () {
			var regex = new RegExp("^" + self.key + "_"),
				ldata;

			ldata = Object.keys(localStorage).filter(function (i) {
				return regex.test(i);
			});

			test.equal(ldata.length, 0, "Should match");
			test.done();
		}, function () {
			test.done();
		});
	}
};

exports["remove - record"] = {
	setUp: function (done) {
		this.data = clone(data);
		this.localStorage = localStorage;
		this.store = haro(null, config);
		this.store.register("local", adapter);
		this.key = this.store.adapters.local;
		done();
	},
	test: function (test) {
		var self = this,
			key;

		test.expect(3);
		test.equal(this.store.total, 0, "Should be 0");
		this.store.batch(this.data, "set").then(function (args) {
			key = args[0][0];
			test.equal(self.store.total, 2, "Should be 2");
			return self.store.unload("local", key);
		}, function () {
			test.done();
		}).then(function () {
			var ldata = JSON.parse(self.localStorage.getItem(self.key + "_" + key));

			test.equal(ldata, null, "Should match");
			test.done();
		}, function () {
			test.done();
		});
	}
};
