/* 
 lithe 
 @author xiaojue [designsor@gmail.com] 
 @fileoverview a javascript common loader 
 @vserion 0.1.9 
 */
(function(global, undef) {
	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	if (isBrowser) {
		//tools function
		var doc = global.document,
		Arr = Array.prototype,
		Obj = Object,
		toString = Obj.prototype.toString,
		commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
		jsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;

		var forEach = Arr.forEach ? function(arr, fn) {
			arr.forEach(fn);
		}: function(arr, fn) {
			for (var i = 0; i < arr.length; i++) fn(arr[i], i, arr);
		};

		var filter = Arr.filter ? function(arr, fn) {
			return arr.filter(fn);
		}: function() {
			var ret = [];
			forEach(arr, function(item, i, arr) {
				if (fn(item, i, arr)) ret.push(item);
			});
			return ret;
		};

		var map = Arr.map ? function(arr, fn) {
			return arr.map(fn);
		}: function(arr, fn) {
			var ret = [];
			forEach(arr, function(item, i, arr) {
				ret.push(fn(item, i, arr));
			});
			return ret;
		};

		var keys = Obj.keys ? Obj.keys: function(o) {
			var ret = [];
			for (var p in o) {
				if (o.hasOwnProperty(p)) ret.push(p);
			}
			return ret;
		};

		var indexOf = Arr.indexOf ? function(arr, selector) {
			return arr.indexOf(selector);
		}: function(arr, selector) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === selector) return i;
			}
			return - 1;
		};
		function getByTagName(tag, ele) {
			ele = ele || doc;
			return ele ? ele.getElementsByTagName(tag) : ele;
		}

		function noop() {}

		function getAttr(ele, ns) {
			return ele.getAttribute(ns);
		}

		function extend(source, options) {
			for (var i in options) {
				if (options.hasOwnProperty(i)) source[i] = options[i];
			}
			return source;
		}

		function isString(v) {
			return toString.call(v) === '[object String]';
		}

		function isFunction(v) {
			return toString.call(v) === '[object Function]';
		}

		function isObject(v) {
			return v === Obj(v);
		}

		function unique(arr) {
			var o = {};
			forEach(arr, function(item) {
				o[item] = 1;
			});
			return tool.keys(o);
		}

		function attr(node, ns) {
		    return node.getAttribute(ns);
		}

		//处理依赖部分

		function getDependencies(code){
		    var deps = [];
		    code.replace(commentRegExp,'').replace(jsRequireRegExp,function(match,dep){
		        deps.push(dep); 
		    });
		    return unique(deps);
		}

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


		function isAbsolute(url) {
			return id.indexOf('://') > 0 || id.indexOf('//') === 0;
		}

		function isDir(url) {
			return !! filename(url);
		}

		function dirname(url) {
			var s = path.match(/[^?]*(?=\/.*$)/);
			return (s ? s[0] : '.') + '/';
		}

		function filename(url) {
			return path.slice(path.lastIndexOf('/') + 1).replace(/\?.*$/, '');
		}

		function realpath(url) {
			var multiple_slash_re = /([^:\/])\/\/+/g;
			multiple_slash_re.lastIndex = 0;
			if (multiple_slash_re.test(path)) {
				path = path.replace(multiple_slash_re, '$1\/');
			}
			if (path.indexOf('.') === - 1) {
				return path;
			}
			var original = path.split('/'),
			ret = [],
			part;
			for (var i = 0; i < original.length; i++) {
				part = original[i];
				if (part === '..') {
					if (ret.length === 0) {
						throw new Error('The path is invalid: ' + path);
					}
					ret.pop();
				}
				else if (part !== '.') {
					ret.push(part);
				}
			}
			return ret.join('/');
		}

		function normalize(url) {
			url = realpath(url);
			var lastChar = url.charAt(url.length - 1);
			if (lastChar === '/') {
				return url;
			}
			if (lastChar === '#') {
				url = url.slice(0, - 1);
			}
			else if (url.indexOf('?') === - 1 && ! (/\.(?:js)$/).test(url)) {
				url += '.js';
			}
			if (url.indexOf(':80/') > 0) {
				url = url.replace(':80/', '/');
			}
			return url;
		}

		function resolve(id,path) {
			path = dirname(path || module.basepath);
			url = '';
			if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
				if (id.indexOf('./') === 0) {
					id = id.substring(2);
				}
				url = path + id;
			} else if (id.charAt(0) === '/' && id.charAt(1) !== '/') {
				url = path + id.substring(1);
			} else {
				url = path + '/' + id;
			}
			return normalize(url);
		}


		var header = doc.head || getByTagName('head')[0] || doc.documentElement,
		CHARSET = 'utf-8',
		scripts = getByTagName('script'),
		currentJs = scripts[scripts.length - 1],
		BASEPATH = attr(currentJs, 'data-path') || currentJs.src || attr(currentJs, 'src'),
		CONFIG = attr(currentJs, 'data-config'),
		DEBUG = attr(currentJs, 'data-debug') === 'true',
		mainjs = attr(currentJs, 'data-main'),

		fetching = {},
		callbacks = {},
		fetched = {};

		function fetch(url, cb) {
			if (fetched[url]) {
				cb();
				return;
			}
			if (fetching[url]) {
				callbacks[url].push(cb);
				return;
			}
			fetching[url] = true;
			callbacks[url] = [cb];
			getscript(url, function() {
				fetched[url] = true;
				delete fetching[url];
				var fns = callbacks[url];
				if (fns) {
					delete callbacks[url];
					forEach(fns, function(fn) {
						fn();
					});
				}
			},
			CHARSET);
		}

		function getscript(url, cb, charset) {
			var node = createNode('script', charset);
			node.onload = node.onerror = node.onreadystatechange = function() {
				if (/loaded|complete|undefined/.test(node.readyState)) {
					node.onload = node.onerror = node.onreadystatechange = null;
					if (node.parentNode && !DEBUG) node.parentNode.removeChild(node);
					node = undef;
					if (isFunction(cb)) cb();
				}
			};
		}

		function createNode(tag, charset) {
			var node = doc.createElement(tag);
			if (charset) node.charset = charset;
			return node;
		}

		function insertscript(node) {
			var baseElement = getByTagName('base', header)[0];
			baseElement ? header.insertBefore(node, baseElement) : header.appendChild(node);
		}


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


		global.lithe = module;
		global.define = lithe.define;
		if (mainjs) global.lithe.use(mainjs);
	} else {
		exports.tool = require('./lib/lithe-tool.js');
		exports.hfs = require('./lib/lithe-hfs.js');
	}
})(this);
