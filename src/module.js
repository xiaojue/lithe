var anonymouse = [],
config = {},
STATUS = {
	'created': 0,
	'save': 1,
	'ready': 2,
	'compiling': 3,
	'compiled': 4
},
circularStack = [];

//help
function getPureDependencies(mod) {
	var id = mod.id;
	var deps = filter(mod.dependencies, function(dep) {
		circularStack.push(id);
		var isCircular = isCircularWaiting(lithe.cache[resolve(dep)]);
		if (isCircular) {
			//the circular is ready
			circularStack.push(id);
		}
		circularStack.pop();
		return ! isCircular;
	});
	return createUrls(deps);
}

function isCircularWaiting(mod) {
	if (!mod || mod.status !== STATUS.save) return false;
	circularStack.push(mod.id);
	var deps = mod.dependencies;
	if (deps.length) {
		if (isOverlap(deps, circularStack)) return true;
		for (var i = 0; i < deps.length; i++) {
			if (isCircularWaiting(lithe.cache[resolve(deps[i])])) return true;
		}
	}
	circularStack.pop();
	return false;
}

function isOverlap(arrA, arrB) {
	var arrC = arrA.concat(arrB);
	return arrC.length > unique(arrC).length;
}

function createUrls(urls) {
	isString(urls) && (urls = [urls]);
	return map(urls, function(url) {
		return resolve(url);
	});
}

function fetchMods(urls, cb) {
	urls = createUrls(urls);
	LEVENTS.trigger('start', [urls]);
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
		function success(style) {
			LEVENTS.trigger('fetchsuccess', [mod, style]);
			if (mod.status >= STATUS.save) {
				var deps = getPureDependencies(mod);
				deps.length ? fetchMods(deps, function() {
					restart(mod);
				}) : restart(mod);
			} else if (style) {
				restart(mod);
			} else {
				restart();
			}
		}
		mod.status < STATUS.save ? fetch(url, success) : success();
	});
}

function saveAnonymouse() {
	forEach(anonymouse, function(meta) {
		var anonymousemod = lithe.get(meta.id);
		anonymousemod._save(meta);
	});
	anonymouse = [];
}

function realUse(urls, cb) {
	fetchMods(urls, function() {
		urls = createUrls(urls);
		var args = map(urls, function(url) {
			return url ? lithe.get(url)._compile() : null;
		});
		if (isFunction(cb)) {
			cb.apply(null, args);
		}
		LEVENTS.trigger('end');
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
	if (config.basepath) lithe.basepath = config.basepath;
	lithe.config = config;
	CONFIGSTMAP = config.timestamp;
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
			id = normalize(resolve(id), true);
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
		lithe.events.trigger('compiled', [mod]);
		return mod.exports;
	},
	_save: function(meta) {
		if (this.status < STATUS.save) {
			this.id = meta.id;
			this.name = meta.name;
			this.dependencies = meta.deps;
			this.factory = meta.factory;
			this.status = STATUS.save;
		}
	}
});

var lithe = extend({
	basepath: BASEPATH,
	events: LEVENTS,
	cache: {},
	get: function(url) {
		url = normalize(url, true);
		return lithe.cache[url] || (lithe.cache[url] = new module(url));
	},
	define: function(id, factory) {
		var deps = getDependencies(factory.toString());
		var meta = {
			id: resolve(id),
			name: id,
			deps: deps,
			factory: factory
		};
		anonymouse.push(meta);
		saveAnonymouse();
	},
	use: function(urls, cb) { (!CONFIG || config.init) ? realUse(urls, cb) : function() {
			realUse(CONFIG, function(cg) {
				setConfig(cg);
				realUse(urls, cb);
			});
		} ();
	}
});

if (CONFIG) CONFIG = createUrls(CONFIG);

