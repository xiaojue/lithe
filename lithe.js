/* @author xiaojue[designsor@gmail.com]
 * @fileoverview lithe module
 */
(function(global, undef) {

	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	if (isBrowser) {
		var doc = global.document,
		loc = global.location,
		noop = function() {},
		Arr = Array.prototype,
		Obj = Object,
        ALIAS,
        TIMESTAMP,
		CHARSET = 'utf-8',
		toString = Obj.prototype.toString,
		header = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
		UA = navigator.userAgent,
		less536Webkit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) < 536,
		less9Firefox = UA.indexOf('Firefox') > 0 && ! ('onload' in doc.createElement('link')),
		scripts = doc.getElementsByTagName('script'),
		currentLoadedScript = scripts[scripts.length - 1],
		BASEPATH = currentLoadedScript.getAttribute('data-path') || currentLoadedScript.src || currentLoadedScript.getAttribute('src'),
		CONFIG = currentLoadedScript.getAttribute('data-config'),
		mainjs = currentLoadedScript.getAttribute('data-main'),
		baseElement = header.getElementsByTagName('base')[0],
		commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
		jsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
		fetching = {},
		callbacks = {},
		fetched = {},
		circularStack = [],
		extend = function(source, options) {
			if (arguments.length === 1) return source;
			else {
				for (var i in options) {
					if (options.hasOwnProperty(i)) source[i] = options[i];
				}
				return source;
			}
		};

		var tool = extend({
			isString: function(v) {
				return toString.call(v) === '[object String]';
			},
			isFunction: function(v) {
				return toString.call(v) === '[object Function]';
			},
			isObject: function(v) {
				return v === Obj(v);
			},
			forEach: Arr.forEach ? function(arr, fn) {
				arr.forEach(fn);
			}: function(arr, fn) {
				for (var i = 0; i < arr.length; i++) fn(arr[i], i, arr);
			},
			filter: Arr.filter ? function(arr, fn) {
				return arr.filter(fn);
			}: function(arr, fn) {
				var ret = [];
				tool.forEach(arr, function(item, i, arr) {
					if (fn(item, i, arr)) ret.push(item);
				});
				return ret;
			},
			map: Arr.map ? function(arr, fn) {
				return arr.map(fn);
			}: function(arr, fn) {
				var ret = [];
				tool.forEach(arr, function(item, i, arr) {
					ret.push(fn(item, i, arr));
				});
				return ret;
			},
			keys: Obj.keys ? Obj.keys: function(o) {
				var ret = [];
				for (var p in o) {
					if (o.hasOwnProperty(p)) ret.push(p);
				}
				return ret;
			},
			indexOf: Arr.indexOf ? function(arr, selector) {
				return arr.indexOf(selector);
			}: function(arr, selector) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] === selector) return i;
				}
				return - 1;
			},
			unique: function(arr) {
				var o = {};
				tool.forEach(arr, function(item) {
					o[item] = 1;
				});
				return tool.keys(o);
			},
			_poll: function(node, cb) {
				var loaded;
				if (less536Webkit && node['sheet']) loaded = true;
				else if (less9Firefox && node['sheet']) {
					try {
						if (node['sheet'].cssRules) loaded = true;
					} catch(e) {
						if (e.name === 'NS_ERROR_DOM_SECURITY_ERR') loaded = true;
					}
				}
				setTimeout(function() {
					if (loaded && tool.isFunction(cb)) cb();
					else if (!loaded) tool._poll(node, cb);
				},
				1);
			},
			_createNode: function(tag, charset) {
				var node = doc.createElement(tag);
				if (charset) node.charset = charset;
				return node;
			},
			_insertScript: function(node) {
				baseElement ? header.insertBefore(node, baseElement) : header.appendChild(node);
			},
			getScript: function(url, cb, charset) {
				var node = tool._createNode('script', charset);
				node.onload = node.onerror = node.onreadystatechange = function() {
					if (/loaded|complete|undefined/.test(node.readyState)) {
						node.onload = node.onerror = node.onreadystatechange = null;
						if (node.parentNode) node.parentNode.removeChild(node);
						node = undef;
						if (tool.isFunction(cb)) cb();
					}
				};
				node.async = 'async';
				node.src = url;
				tool._insertScript(node);
			},
			_fetch: function(url, cb) {
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
				tool.getScript(url, function() {
					fetched[url] = true;
					delete fetching[url];
					var fns = callbacks[url];
					if (fns) {
						delete callbacks[url];
						tool.forEach(fns, function(fn) {
							fn();
						});
					}
				},
				CHARSET);
			},
			getDependencies: function(code) {
				var deps = [];
				code.replace(commentRegExp, '').replace(jsRequireRegExp, function(match, dep) {
					deps.push(dep);
				});
				return tool.unique(deps);
			},
			getPureDependencies: function(mod) {
				var id = mod.id;
				return tool.filter(mod.dependencies, function(dep) {
					circularStack.push(id);
					var isCircular = tool.isCircularWaiting(module.cache[dep]);
					if (isCircular) {
						//the circular is ready
						circularStack.push(id);
					}
					circularStack.pop();
					return ! isCircular;
				});
			},
			isCircularWaiting: function(mod) {
				if (!mod || mod.status !== module.status.save) return false;
				circularStack.push(mod.uri);
				var deps = mod.dependencies;
				if (deps.length) {
					if (tool.isOverlap(deps, circularStack)) return true;
					for (var i = 0; i < deps.length; i++) {
						if (tool.isCircularWaiting(module.cache[deps[i]])) return true;
					}
				}
				circularStack.pop();
				return false;
			},
			isOverlap: function(arrA, arrB) {
				var arrC = arrA.concat(arrB);
				return arrC.length > tool.unique(arrC).length;
			},
			runModuleContext: function(fn, mod) {
				var ret = fn(mod.require, mod.exports, mod);
				if (ret !== undef) mod.exports = ret;
			},
			dirname: function(path) {
				var s = path.match(/[^?]*(?=\/.*$)/);
				return (s ? s[0] : '.') + '/';
			},
			realpath: function(path) {
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
			},
			normalize: function(url) {
				url = tool.realpath(url);
				var lastChar = url.charAt(url.length - 1);
				if (lastChar === '/') {
					return url;
				}
				if (lastChar === '#') {
					url = url.slice(0, - 1);
				}
				else if (url.indexOf('?') === - 1 && ! (/\.(?:css|js)$/).test(url)) {
					url += '.js';
				}
				if (url.indexOf(':80/') > 0) {
					url = url.replace(':80/', '/');
				}
				return url;
			},
			resolve: function(id, path) {
				var ret = '';
				if (!id) {
					return ret;
					//isRelativePath
				} else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
					if (id.indexOf('./') === 0) {
						id = id.substring(2);
					}
					ret = tool.dirname(path) + id;
				} else if (id.charAt(0) === '/' && id.charAt(1) !== '/') {
					ret = tool.dirname(path) + id.substring(1);
				} else {
					ret = tool.dirname(path) + '/' + id;
				}
				return tool.normalize(ret);
			},
			createUrl: function(ids) {
				return tool.map(ids, function(id) {
					//alias
					if (ALIAS && ALIAS.hasOwnProperty(id)) id = ALIAS[id];
					//isAbsolute
					if (id.indexOf('://') > 0 || id.indexOf('//') === 0){
                        if (TIMESTAMP) id = id + '?' + TIMESTAMP;
                        return id;
                    }else{ 
                        id = tool.resolve(id, BASEPATH);
                        if (TIMESTAMP) id = id + '?' + TIMESTAMP;
                        return id;
                    }
				});
			}
		});

		function module(id) {
			this.id = id;
			this.status = 0;
			this.dependencies = [];
			this.exports = null;
			this.parent = [];
			this.factory = noop;
		}

		extend(module, {
			cache: {},
			status: {
				'created': 0,
				'save': 1,
				'ready': 2,
				'compiling': 3,
				'compiled': 4
			},
			define: function(id, factory) {
				if (!tool.isString(id) || ! tool.isFunction(factory)) {
					throw 'define failed';
				}
				id = tool.createUrl([id]);
				var deps = tool.getDependencies(factory.toString()),
				mod = module.cache[id] || (module.cache[id] = new module(id));
				if (mod.status < module.status.save) {
					mod.id = id;
					mod.dependencies = tool.createUrl(deps);
					mod.factory = factory;
					mod.status = module.status.save;
				}
			},
			use: function(ids, cb) {
				tool.isString(ids) && (ids = [ids]);
				var urls = tool.createUrl(ids);

				module._fetch(urls, function() {
					var args = tool.map(urls, function(url) {
						return url ? module.cache[url]._compile() : null;
					});
					if (tool.isFunction(cb)) cb.apply(null, args);
				});
			},
			_fetch: function(urls, cb) {
				var STATUS = module.status,
				loadUris = tool.filter(urls, function(url) {
					return url && (!module.cache[url] || module.cache[url].status < STATUS.ready);
				}),
				len = loadUris.length;
				if (len === 0) {
					cb();
					return;
				}
				var queue = len;
				for (var i = 0; i < len; i++) { (function(url) {
						var mod = module.cache[url] || (module.cache[url] = new module(url));
						mod.status < module.status.save ? tool._fetch(url, success) : success();
						function success() {
							//before success the define method all ready changed mod and created new dependencies
							mod = module.cache[url];
							if (mod.status >= STATUS.save) {
								var deps = tool.getPureDependencies(mod);
								if (deps.length) {
									module._fetch(deps, function() {
										restart(mod);
									});
								} else {
									restart(mod);
								}
							} else {
								//404 or no module
								restart();
							}
						}
					})(loadUris[i]);
					function restart(mod) { (mod || {}).status < STATUS.ready && (mod.status = STATUS.ready); --queue;
						(queue === 0) && cb();
					}
				}
			}
		});

		extend(module.prototype, {
			_compile: function() {
				var mod = this,
				STATUS = module.status;
				if (mod.status === STATUS.compiled) return mod.exports;
				if (mod.status < STATUS.save) return null;
				mod.status = STATUS.compiling;
				function require(id) {
					var child = module.cache[tool.createUrl([id])];
					if (!child) return null;
					if (child.status === STATUS.compiled) return child.exports;
					child.parent = mod;
					return child._compile();
				}
				require.cache = module.cache;
				mod.require = require;
				mod.exports = {};
				var fun = mod.factory;
				if (tool.isFunction(fun)) {
					tool.runModuleContext(fun, mod);
				}
				mod.status = STATUS.compiled;
				return mod.exports;
			}
		});

		//browser api
		global.define = module.define;
		global.lithe = extend({
			use: module.use
		});
		//use by prev config loaded
		if (CONFIG) {
			module.use(CONFIG, function(cg) {
                if(cg.hasOwnProperty('alias')) ALIAS = cg.alias;
                if(cg.hasOwnProperty('base')) BASEPATH = cg.base;
                if(cg.hasOwnProperty('timestamp')) TIMESTAMP = cg.timestamp;
				module.use(mainjs);
			});
		} else {
			module.use(mainjs);
		}
	} else {
		//node api 
		exports.tool = require('./lib/lithe-tool.js');
		exports.hfs = require('./lib/lithe-hfs.js');
	}
})(this);
