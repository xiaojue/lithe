var anonymouse = [],
config = {},
STATUS = {
	'created': 0,
	'save': 1,
	'ready': 2,
	'compiling': 3,
	'compiled': 4
},
stack = [];

//help
function isReadyDependencies(mod) {
	if (!mod || mod.status !== STATUS.save) return false;
	var deps = mod.dependencies;
	if (deps.length) {
		if (isOverlap(deps, stack)) return true;
		for (var i = 0; i < deps.length; i++) {
			if (isReadyDependencies(lithe.cache[deps[i]])) return true;
		}
	}
	stack.pop();
	return false;
}

function isOverlap(a, b) {
	var c = a.concat(b);
	return c.length > unique(c).length;
}

function getPureDependencies(mod) {
	return filter(mod.dependencies, function(dep) {
		stack.push(mod.id);
		return ! isReadyDependencies(lithe.cache[dep]);
	});
}

function createUrls(urls) {
	isString(urls) && (urls = [urls]);
	return map(urls, function(url) {
		return resolve(url);
	});
}

function fetchMods(urls, cb) {
	urls = createUrls(urls);
	var loadUris = filter(urls, function(url) {
		return url && (!lithe.cache[url] || lithe.cache[url].status < STATUS.ready);
	}),
	len = loadUris.length;
	if (len === 0) {
		cb();
		return;
	}
	var queue = len;
	function restart(mod) { (mod || {}).status < STATUS.ready && (mod.status = STATUS.ready); --queue;
		(queue === 0) && cb();
	}
	forEach(loadUris, function(url) {
		var mod = lithe.get(url);
		function success() {
			forEach(anonymouse, function(meta) {
				mod._save(meta, url);
			});
			anonymouse = [];
			if (mod.status >= STATUS.save) {
				var deps = getPureDependencies(mod);
				deps.length ? fetchMods(deps, function() {
					restart(mod);
				}) : restart(mod);
			} else {
				restart();
			}
		}
		mod.status < STATUS.save ? fetch(url, success) : success();
	});
}

function realUse(urls, cb) {
	fetchMods(urls, function() {
		urls = createUrls(urls);
		var args = map(urls, function(url) {
			return url ? lithe.cache[url]._compile() : null;
		});
		if (isFunction(cb)) cb.apply(null, args);
	});
}

function setConfig(cg) {
	config = cg;
	config.directorys = [];
	var alias = config.alias,
	i, alia, dir;
	if (alias) {
		for (i in alias) {
			alia = alias[i];
			if (isDir(alia)) {
				dir = {};
				dir[i] = alia;
				config.directorys.push(dir);
			}
		}
	}
	config.init = true;
}

function module(url) {
	this.id = url;
	this.status = 0;
	this.dependencies = [];
	this.exports = null;
	this.parent = [];
	this.factory = noop;
}

extend(module.prototype, {
	_compile: function() {
		var mod = this;
		if (mod.status === STATUS.compiled) return mod.exports;
		if (mod.status < STATUS.save) return null;
		mod.status = STATUS.compiling;
		function require(id) {
			id = resolve(id);
			var child = lithe.cache[id];
			if (!child) return null;
			if (child.status === STATUS.compiling) return child.exports;
			child.parent = mod;
			return child._compile();
		}
		require.cache = lithe.cache;
		mod.require = require;
		mod.exports = {};
		var fun = mod.factory;
		if (isFunction(fun)) runModuleContext(fun, mod);
		mod.status = STATUS.compiled;
		return mod.exports;
	},
	_save: function(meta, url) {
		if (this.status < STATUS.save) {
			this.id = resolve(meta.id, url);
			this.dependencies = meta.deps;
			this.factory = meta.factory;
			this.status = STATUS.save;
		}
	}
});

var lithe = extend({
	basepath: BASEPATH,
	config: CONFIG,
	cache: {},
	get: function(url) {
		return lithe.cache[url] || (lithe.cache[url] = new module(url));
	},
	define: function(id, factory) {
		var deps = getDependencies(factory.toString());
		var meta = {
			id: id,
			deps: deps,
			factory: factory
		};
		anonymouse.push(meta);
	},
	use: function(urls, cb) {
		config.init ? realUse(urls, cb) : realUse(CONFIG, function(cg) {
			setConfig(cg);
			realUse(urls, cb);
		});
	}
});

