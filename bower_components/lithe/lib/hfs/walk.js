var fs = require('fs'),
path = require('path');

function collect(opts, el, prop) {
	if ((typeof opts.filter == "function") ? opts.filter(el) : true) {
		opts[prop].push(el);
		if (opts.one === true) {
			opts.filter = function() {
				return false;
			};
			opts.count = 0;
		}
	}
}

function sync(p, opts) {
	try {
		var stat = fs.statSync(p);
		var prop = stat.isDirectory() ? "dirs": "files";
		collect(opts, p, prop);
		if (prop === "dirs") {
			var array = fs.readdirSync(p);
			for (var i = 0, n = array.length; i < n; i++) {
				sync(path.join(p, array[i]), opts);
			}
		}
	} catch(e) {}
}

function walk(p, cb, opts) {
	if (typeof cb == "object") {
		opts = cb;
		cb = opts.cb;
	}
	opts = opts || {};
	opts.files = [];
	opts.dirs = [];
	opts.cb = typeof cb === "function" ? cb: function() {};
	opts.count = 0;
	sync(path.normalize(p), opts);
	opts.cb(opts.files, opts.dirs);
}

module.exports = walk;
