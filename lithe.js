/* @author xiaojue[designsor@gmail.com]
 * @fileoverview lithe module
 */
(function() {
	var win = window,
	doc = document,
	loc = win.location,
	noop = function() {},
	Arr = Array.prototype,
	Obj = Object,
	toString = Obj.prototype.toString,
	header = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
	UA = navigator.userAgent,
	less536Webkit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) < 536,
	less9Firefox = UA.indexOf('Firefox') > 0 && ! ('onload' in doc.createElement('link')),
	scripts = doc.getElementsByTagName('script'),
	currentLoadedScript = scripts[scripts.length - 1],
	BASEPATH = currentLoadedScript.src || currentLoadedScript.getAttribute('src'),
	baseElement = header.getElementsByTagName('base')[0],
	commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
	jsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
	currentScript,
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
		isArray: function(v) {
			return toString.call(v) === '[object Array]';
		},
		isObject: function(v) {
			return val === obj(val);
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
			var node = document.createElement(tag);
			if (charset) node.charset = charset;
			return node;
		},
		_insertScript: function(node) {
			currentScript = node;
			baseElement ? header.insertBefore(node, baseElement) : header.appendChild(node);
			currentScript = undefined;
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
				//isAbsolute
				if (id.indexOf('://') > 0 || id.indexOf('//') === 0) return id;
				else return tool.resolve(id, BASEPATH);
			});
		},
		getScript: function(url, cb, charset) {
			var node = tool._createNode('script', charset);
			node.onload = node.onerror = node.onreadystatechange = function() {
				if (/loaded|complete|undefined/.test(node.readyState)) {
					node.onload = node.onerror = node.onreadystatechange = null;
					if (node.parentNode) node.parentNode.removeChild(node);
					node = undefined;
					if (tool.isFunction(cb)) cb();
				}
			};
			node.async = 'async';
			node.src = url;
			tool._insertScript(node);
		},
		getCss: function(url, cb, charset) {
			var node = this._createNode('link', charset);
			if (less536Webkit || less9Firefox) {
				setTimeout(function() {
					tool._poll(node, cb);
				},
				1);
			} else {
				node.onload = node.onerror = function() {
					node.onload = node.onerror = null;
					node = undefined;
					if (tool.isFunction(cb)) cb();
				};
			}
			node.rel = 'stylesheet';
			node.href = url;
			tool._insertScript(node);
		}
	});

	function module(id) {
		this.id = id;
		this.status = 0;
		this.dependencies = [];
		this.exports = null;
		this.parent = [];
		this.requires = {};
		this.factory = noop;
	}

	extend(module, {
		cache: {},
		compiles: [],
		status: {
			'created': 0,
			'loading': 1,
			'loaded': 2,
			'save': 3,
			'ready': 4,
			'compiling': 5,
			'compiled': 6
		},
		define: function() {

		},
		require: function() {

		},
		find: function() {

		}
	});

	extend(module.prototype, {
		_use: function(ids, cb) {
			tool.isString(ids) && (ids = [ids]);
			var urls = tool.createUrl(ids);

			this._fetch(urls, function() {
				var args = tool.map(urls, function(url) {
					return url ? module.cache[url]._compile() : null;
				});
				if (tool.isFunction(cb)) cb.apply(null, args);
			});
		},
		_fetch: function(urls, cb) {

		},
		_compile: function() {

		}
	});

})();

