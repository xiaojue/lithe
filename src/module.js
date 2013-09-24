var anonymouse = [],
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
	if (!mod || mod.status !== module.status.save) return false;
	var deps = mod.dependencies;
	if (deps.length) {
		if (isOverlap(deps, stack)) return true;
		for (var i = 0; i < deps.length; i++) {
			if (isReadyDependencies(module.cache[deps[i]])) return true;
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
		return ! isReadyDependencies(module.cache[dep]);
	});
}

function module(url) {
	this.id = url;
	this.status = 0;
	this.dependencies = [];
	this.exports = null;
	this.parent = [];
	this.factory = noop;
}

extend(module,new events());

extend(module, {
	basepath: BASEPATH,
	config: CONFIG,
	cache: {},
	get: function(url) {
		return module.cache[url] || (module.cache[url] = new module(url));
	},
	define: function(id, factory) {
		var deps = getDependencies(factory.toString());
		var meta = {
			id: id,
			deps: deps,
			factory: factory
		};
        this.trigger('initMeta',[meta]);
		anonymouse.push(meta);
	},
	require: function(urls, cb) {
		module._fetch(urls, function() {
			var args = map(urls, function(url) {
				return url ? module.cache[url]._compile() : null;
			});
			if (isFunction(cb)) cb.apply(null, args);
		});
	},
	_fetch: function(urls, cb) {
		var loadUris = filter(urls, function(url) {
			url = resolve(url);
			return url && (!module.cache[url] || module.cache[url].status < STATUS.ready);
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
			var mod = module.get(url);
			function success() {
				forEach(anonymouse, function(meta) {
					mod._save(meta, url);
				});
				anonymouse = [];
				if (mod.status >= STATUS.save) {
					var deps = getPureDependencies(mod);
					deps.length ? module._fetch(deps, function() {
						restart(mod);
					}) : restart(mod);
				} else {
					restart();
				}
			}
			mod.status < STATUS.save ? fetch(url, success) : success();
		});
	}
});

extend(module.prototype, {
	_compile: function() {
		var mod = this;
		if (mod.status === STATUS.compiled) return mod.exports;
		if (mod.status < STATUS.save) return null;
		mod.status = STATUS.compiling;
		function require(id) {
			id = resolve(id);
			var child = module.cache[id];
			if (!child) return null;
			if (child.status === STATUS.compiling) return child.exports;
			child.parent = mod;
			return child._compile();
		}
		require.cache = module.cache;
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

