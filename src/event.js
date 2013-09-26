function events() {
	this.map = {};
}

extend(events.prototype, {
	trigger: function(name, args) {
		var cbs = this.map[name];
		if (cbs) {
			forEach(cbs, function(fn) {
				fn.apply(this, args);
			});
		}
	},
	on: function(name, cb) {
		if (this.map[name]) {
			this.map[name].push(cb);
		} else {
			this.map[name] = [cb];
		}
	}
});
