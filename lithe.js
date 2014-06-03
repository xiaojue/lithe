/* 
 lithe 
 @author xiaojue [designsor@gmail.com] 
 @fileoverview a javascript common loader 
 @vserion 0.3.1 
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
		}: function(arr,fn) {
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
			return keys(o);
		}

		function attr(node, ns) {
			return node.getAttribute(ns);
		}

		//处理依赖部分
		function getDependencies(code) {
			var deps = [];
			code.replace(commentRegExp, '').replace(jsRequireRegExp, function(match, dep) {
				deps.push(dep);
			});
			return unique(deps);
		}

		function runModuleContext(fn, mod) {
			var ret = fn(mod.require, mod.exports, mod);
			if (ret !== undef) mod.exports = ret;
		}


		function events() {
			this.map = {};
		}

		extend(events.prototype, {
			trigger: function(name, args) {
				var self = this,
				cbs = this.map[name];
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

		var LEVENTS = new events();


		function getTimeStamp(url) {
			var query = url.slice(url.lastIndexOf('?') + 1).split('&');
			for (var i = 0; i < query.length; i++) {
				var item = query[i].split('='),
				key = item[0],
				val = item[1];
				if (key == 'timestamp') return val;
			}
			return null;
		}

		function isAbsolute(url) {
			return url.indexOf('://') > 0 || url.indexOf('//') === 0;
		}

		function isDir(url) {
			return ! filename(url);
		}

		function dirname(url) {
			var s = url.match(/[^?]*(?=\/.*$)/);
			return (s ? s[0] : '.') + '/';
		}

		function filename(url) {
			return url.slice(url.lastIndexOf('/') + 1).replace(/\?.*$/, '');
		}

		function realpath(path) {
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

		function normalize(url, t) {
			url = realpath(url);
			var lastChar = url.charAt(url.length - 1);
			if (lastChar === '/') {
				return url;
			}
			if (lastChar === '#') {
				url = url.slice(0, - 1);
			}
			else if (url.indexOf('?') === - 1 && ! (/\.(?:js|css)$/).test(url)) {
				url += '.js';
			}
			if (url.indexOf(':80/') > 0) {
				url = url.replace(':80/', '/');
			}
			if (t) url = url.replace(/\?.+$/, '');
			return url;
		}

		function replaceDir(id) {
			//只替换一次,且如果路径包含2个dir，也只替换一次,并且只匹配第一个，之后的不匹配
			// UI:../ -> UI/test = ../test
			// UI:../ -> UI/UI/test = ../UI/test
			// UI:../ -> ../a/UI/test = ../a/UI/test [不会替换]
			// UI:../ -> a/UI/test = a/UI/test [不会替换]
			var locks = {},
			directorys = config.directorys,
			k, path, reg, dir, j;
			for (k = 0; k < directorys.length; k++) {
				if (locks[id]) break;
				dir = directorys[k];
				for (j in dir) {
					path = dir[j];
					reg = new RegExp("^" + j + "\/");
					if (reg.test(id) && ! locks[id]) {
						id = id.replace(reg, path);
						locks[id] = true;
						break;
					}
				}
			}
			return id;
		}

		function replaceId(id) {
			var alias = config.alias;
			if (alias) {
				var newid = alias[id];
				return newid ? newid: replaceDir(id);
			}
			return id;
		}

		function resolve(id, path) {
			path = dirname(path || lithe.basepath);
			if (isAbsolute(id)) return id;
			if (config.init) id = replaceId(id);
			var url = '';
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
		GLOBALTIMESTAMP = getTimeStamp(currentJs.src),
		CONFIGSTMAP = null,
		mainjs = attr(currentJs, 'data-main'),

		fetching = {},
		callbacks = {},
		fetched = {};

		function fetch(url, cb) {
			LEVENTS.trigger('fetch', [url, cb]);
		}

		LEVENTS.on('fetch', function(url, cb) {
			if (! (/\.css$/).test(url)) {
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
		});

		function getscript(url, cb, charset) {
			var node = createNode('script', charset);
			node.onload = node.onerror = node.onreadystatechange = function() {
				if (/loaded|complete|undefined/.test(node.readyState)) {
					node.onload = node.onerror = node.onreadystatechange = null;
					if (node.parentNode && ! DEBUG) node.parentNode.removeChild(node);
					node = undef;
					if (isFunction(cb)) cb();
				}
			};
			node.async = 'async';
			var timestamp = CONFIGSTMAP ? CONFIGSTMAP : GLOBALTIMESTAMP;
			url = timestamp ? url + '?timestamp=' + timestamp : url;
			node.src = url;
			insertscript(node);
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


		global.lithe = lithe;
		global.define = lithe.define;
		if (mainjs) {
			setTimeout(function() {
				global.lithe.use(mainjs);
			});
		}
	} else {
		exports.tool = require('./lib/lithe-tool.js');
		exports.hfs = require('./lib/lithe-hfs.js');
	}
})(this);

