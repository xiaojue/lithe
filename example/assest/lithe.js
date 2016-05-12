/**
 lithe
 @author  []
 @fileoverview a javascript common loader
 @vserion 0.3.4
 **/
(function(global, undef) {
	var isBrowser = !!(
			typeof window !== undef &&
			global.navigator &&
			global.document
	);

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
			for (var i = 0; i < arr.length; i++){
				fn(arr[i], i, arr);
			}
		};

		var filter = Arr.filter ? function(arr, fn) {
			return arr.filter(fn);
		}: function(arr,fn) {
			var ret = [];
			forEach(arr, function(item, i, arr) {
				if (fn(item, i, arr)){
					ret.push(item);
				}
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
				if (o.hasOwnProperty(p)){
					ret.push(p);
				}
			}
			return ret;
		};

		var values = function(obj) {
			var values = [];
			for(var pro in obj){
				if (obj.hasOwnProperty(pro)){
					if (isArray(obj[pro])) {
						forEach(obj[pro], function(current){
							values.push(current);
						});
					}else {
						values.push(obj[pro]);
					}
				}
			}
			return values;
		};

		var indexOf = Arr.indexOf ? function(arr, selector) {
			return arr.indexOf(selector);
		}: function(arr, selector) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === selector){
					return i;
				}
			}
			return - 1;
		};

		var getByTagName = function(tag, ele) {
			ele = ele || doc;
			return ele ? ele.getElementsByTagName(tag) : ele;
		};

		var noop = function(){};

		var getAttr = function(ele, ns) {
			return ele.getAttribute(ns);
		};

		var extend = function(source, options) {
			for (var i in options) {
				if (options.hasOwnProperty(i)){
					source[i] = options[i];
				}
			}
			return source;
		};

		var isString = function(v) {
			return toString.call(v) === '[object String]';
		};

		var isFunction = function isFunction(v) {
			return toString.call(v) === '[object Function]';
		};

		var isArray = function isFunction(v) {
			return toString.call(v) === '[object Array]';
		};

		var isObject = function isObject(v) {
			return v === Obj(v);
		};

		var unique = function unique(arr) {
			var o = {};
			forEach(arr, function(item) {
				o[item] = 1;
			});
			return keys(o);
		};

		var attr = function attr(node, ns) {
			return node.getAttribute(ns);
		};

		//处理依赖部分
		var getDependencies = function(code) {
			var deps = [];
			code.replace(commentRegExp, '').replace(jsRequireRegExp, function(match, dep) {
				deps.push(dep);
			});
			return unique(deps);
		};

		var runModuleContext = function(fn, mod) {
			var ret = fn(mod.require, mod.exports, mod);
			if (ret !== undef){
				mod.exports = ret;
			}
		};



		var Events = function() {
			this.map = {};
		};

		extend(Events.prototype, {
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

		var LEVENTS = new Events();



		var getTimeStamp = function(url) {
			var query = url.slice(url.lastIndexOf('?') + 1).split('&');
			for (var i = 0; i < query.length; i++) {
				var item = query[i].split('='),
						key = item[0],
						val = item[1];
				if (key === 'timestamp'){
					return val;
				}
			}
			return null;
		};

		var isAbsolute = function(url) {
			return url.indexOf('://') > 0 || url.indexOf('//') === 0;
		};

		var isDir = function(url) {
			return ! filename(url);
		};

		var dirname = function(url) {
			var s = url.match(/[^?]*(?=\/.*$)/);
			return (s ? s[0] : '.') + '/';
		};

		var filename = function(url) {
			return url.slice(url.lastIndexOf('/') + 1).replace(/\?.*$/, '');
		};

		var realpath = function(path){
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
		};

		var normalize = function(url, t) {
			url = realpath(url);
			var lastChar = url.charAt(url.length - 1);
			if (lastChar === '/') {
				return url;
			}
			if (lastChar === '#') {
				url = url.slice(0, - 1);
			}
			else if (url.indexOf('?') === - 1 && ! (/\.(?:js|css)$/).test(url)) {
				url += jsExt;
			}
			if (url.indexOf(':80/') > 0) {
				url = url.replace(':80/', '/');
			}
			if (t){
				url = url.replace(/\?.+$/, '');
			}
			return url;
		};

		var replaceDir = function(id) {
			//只替换一次,且如果路径包含2个dir，也只替换一次,并且只匹配第一个，之后的不匹配
			// UI:../ -> UI/test = ../test
			// UI:../ -> UI/UI/test = ../UI/test
			// UI:../ -> ../a/UI/test = ../a/UI/test [不会替换]
			// UI:../ -> a/UI/test = a/UI/test [不会替换]
			var locks = {},
					k, path, reg, dir, j;
			for (k = 0; k < directorys.length; k++) {
				if (locks[id]){
					break;
				}
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
		};

		var replaceId = function(id) {
			var alias = config.alias;
			if (alias) {
				var newid = alias[id];
				return newid ? newid: replaceDir(id);
			}
			return id;
		};

		var resolve = function(id, path) {
			// 改动,处理public依赖的路径

			if (lithe.publicpath && isPublicDeps(id).isPublicDeps) {
				path = lithe.publicpath;
			}else {
				path = dirname(path || lithe.basepath);
			}

			if (isAbsolute(id)){
				return id;
			}
			if (isInitConfig){
				id = replaceId(id);
			}
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
		};


		var header = doc.head || getByTagName('head')[0] || doc.documentElement,
				scripts = getByTagName('script'),
				currentJs = scripts[scripts.length - 1],
				currentPath = currentJs.src || attr(currentJs, 'src'),
				BASEPATH = attr(currentJs, 'data-path') || currentPath,
				CONFIG = attr(currentJs, 'data-config'),
				CHARSET = attr(currentJs, 'charset') || 'utf8',
				DEBUG = attr(currentJs, 'data-debug') === 'true',
				DYNAMICCONFIG = attr(currentJs,'data-config-dynamic') === 'true',
				GLOBALTIMESTAMP = getTimeStamp(currentJs.src),
				CONFIGSTMAP = null,
				mainjs = attr(currentJs, 'data-main'),

				fetching = {},
				callbacks = {},
				fetched = {},
				publicDeps = [], // 改动,增加public依赖数组;
				jsExt = ".js"; // 改动,js后缀

		BASEPATH = (BASEPATH === currentPath) ? dirname(currentPath) : resolve(BASEPATH, dirname(currentPath));

		var fetch = function(url, cb) {
			LEVENTS.trigger('fetch', [url, cb]);
		};

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

		var loadeds = {};

		var getscript = function(urls, cb, charset) {
			var url = isArray(urls) ? urls.shift() : urls;
			function success() {
				if (isArray(urls) && urls.length) {
					getscript(urls, cb, charset);
				} else {
					if (isFunction(cb)) {
						cb();
					}
				}
			}
			if (loadeds[url]) {
				success();
				return;
			}
			if (url) {
				var node = createNode('script', charset);
				node.onload = node.onerror = node.onreadystatechange = function() {
					if (/loaded|complete|undefined/.test(node.readyState)) {
						node.onload = node.onerror = node.onreadystatechange = null;
						if (node.parentNode && ! DEBUG) {
							node.parentNode.removeChild(node);
						}
						node = undef;
						loadeds[url] = true;
						success();
					}
				};
				node.async = 'async';
				var timestamp;
				if(DYNAMICCONFIG){
					timestamp = CONFIGSTMAP ? CONFIGSTMAP : new Date().valueOf();
				}else{
					timestamp = CONFIGSTMAP ? CONFIGSTMAP : GLOBALTIMESTAMP;
				}
				url = timestamp ? url + '?timestamp=' + timestamp: url;
				node.src = url;
				insertscript(node);
			} else {
				throw new Error('getscript url is ' + url);
			}
		};

		var createNode = function(tag, charset) {
			var node = doc.createElement(tag);
			node.charset = charset ? charset: CHARSET;
			return node;
		};

		var insertscript = function(node) {
			var baseElement = getByTagName('base', header)[0];
			if (baseElement) {
				header.insertBefore(node, baseElement);
			} else {
				header.appendChild(node);
			}
		};



		var anonymouse = [],
				config = {},
				STATUS = {
					'created': 0,
					'save': 1,
					'ready': 2,
					'compiling': 3,
					'compiled': 4
				},
				circularStack = [],
				directorys = [],
				isInitConfig;

		// 改动

		var _verifyDeps = function (deps, dep, ext) {
			if (deps.indexOf(dep + ext) !== -1) {
				return {
					isPublicDeps : true,
					dep : dep
				};
			}else {
				return {
					isPublicDeps : false,
					dep : null
				};
			}
		};

		// 改动

		var isPublicDeps = function(dep) {
			if (lithe.config.publicdeps) {
				var deps = Object.keys(lithe.config.publicdeps),
						isDeps;

				dep = lithe.config.alias && lithe.config.alias[dep] ? lithe.config.alias[dep] : dep;

				var pDeps = map(deps, function (d) {
					if (d.lastIndexOf(jsExt) < 0){
						return d + jsExt;
					}else {
						return d;
					}
				});

				// 如果结尾有js

				if ((/\.(?:js)$/).test(dep)) {
					isDeps = _verifyDeps(pDeps, dep, "");
				}

				if (!(/\.(?:js)$/).test(dep)) {
					isDeps = _verifyDeps(pDeps, dep, jsExt);
				}

				return isDeps;
			}else {
				return {
					isPublicDeps : false,
					dep : null
				};
			}
		};

		//help
		var getPureDependencies = function(mod) {
			var id = mod.id;
			var deps = filter(mod.dependencies, function(dep) {

				// 改动,过滤当前模块所有依赖的pubic依赖,并存储到publicDeps数组中

				if (lithe.config.publicdeps) {
					var flag = isPublicDeps(dep);
					if (flag.isPublicDeps) {
						savePublicDeps(flag.dep);
						return;
					}
				}

				circularStack.push(id);
				var isCircular = isCircularWaiting(lithe.cache[resolve(dep)]);
				if (isCircular) {
					//the circular is ready
					circularStack.push(id);
				}
				circularStack.pop();
				return ! isCircular;
			});
			// 改动,返回非public依赖

			var businessDeps = createUrls(deps);
			return businessDeps;
		};

		// 改动,存储public依赖

		var savePublicDeps = function(dep) {
			publicDeps.push(dep);
			publicDeps = unique(publicDeps);
		};

		var isCircularWaiting = function(mod) {
			if (!mod || mod.status !== STATUS.save){
				return false;
			}
			circularStack.push(mod.id);
			var deps = mod.dependencies;
			if (deps.length) {
				if (isOverlap(deps, circularStack)){
					return true;
				}
				for (var i = 0; i < deps.length; i++) {
					if (isCircularWaiting(lithe.cache[resolve(deps[i])])){
						return true;
					}
				}
			}
			circularStack.pop();
			return false;
		};

		var isOverlap = function(arrA, arrB) {
			var arrC = arrA.concat(arrB);
			return arrC.length > unique(arrC).length;
		};

		var createUrls = function(urls) {
			if(isString(urls)){
				urls = [urls];
			}
			return map(urls, function(url) {
				return resolve(url);
			});
		};

		var fetchMods = function(urls, cb) {
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

			var restart = function(mod) {
				if((mod || {}).status < STATUS.ready){
					mod.status = STATUS.ready;
				}
				--queue;
				if(queue === 0){
					cb();
				}
			};

			forEach(loadUris, function(url) {
				var mod = lithe.get(url);
				function success(style) {
					LEVENTS.trigger('fetchsuccess', [mod, style]);
					if (mod.status >= STATUS.save) {
						var deps = getPureDependencies(mod);
						if(deps.length){
							fetchMods(deps, function() {
								restart(mod);
							});
						}else{
							restart(mod);
						}
					} else if (style) {
						restart(mod);
					} else {
						restart();
					}
				}
				if(mod.status < STATUS.save){
					fetch(url, success);
				}else{
					success();
				}
			});
		};

		var saveAnonymouse = function() {
			forEach(anonymouse, function(meta) {
				var anonymousemod = lithe.get(meta.id);
				anonymousemod._save(meta);
			});
			anonymouse = [];
		};

		var realUse = function(urls, cb) {
			fetchMods(urls, function() {
				urls = createUrls(urls);

				// 改动,加载public依赖

				loadPublicDeps(function(){
					var args = map(urls, function(url) {
						return url ? lithe.get(url)._compile() : null;
					});

					if (isFunction(cb)) {
						cb.apply(null, args);
					}

					LEVENTS.trigger('end');
				});
			});
		};

		// 改动,加载public依赖jsFile,修改公共依赖

		var loadPublicDeps = function(cb) {
			if (lithe.publicpath && publicDeps.length) {
				var pDeps = [],
						fDeps = [];

				// 汇总public依赖的依赖包

				forEach(publicDeps, function (deps) {
					values(lithe.config.publicdeps[deps]).forEach(function(rdeps) {
						if (keys(lithe.config.publicdeps).indexOf(rdeps) !== -1) {
							publicDeps.push(rdeps);
						}
					});
				});

				// 如果依赖没有js后缀,就加上js后缀然后汇总
				// 汇总结果有js后缀的和没有js后缀的,用户在config配置的时候有可能有js后缀,也有可能
				// 不写js后缀

				forEach(unique(publicDeps), function(deps){
					if (deps.lastIndexOf(jsExt) < 0){
						pDeps.push(deps);
						pDeps.push(deps + jsExt);
					}else {
						pDeps.push(deps);
					}
				});

				// 获取public依赖的真实路径

				forEach(pDeps, function(deps){
					if (lithe.config.publicdeps[deps]) {
						fDeps.push(keys(lithe.config.publicdeps[deps])[0]);
					}
				});

				var pm = unique(fDeps).join(",");
				var nginxPublic = lithe.publicpath + "??" + pm;
				forEach(publicDeps,function(mod){
					lithe.get(createUrls(mod)[0]);
				});
				getscript(nginxPublic, cb);
			}else{
				cb();
			}
		};

		var setConfig = function(cg) {
			config = cg;
			directorys = [];
			var alias = config.alias,
					i, alia, dir;
			if (alias) {
				for (i in alias) {
					alia = alias[i];
					if (isDir(alia)) {
						dir = {};
						dir[i] = alia;
						directorys.push(dir);
					}
				}
			}
			isInitConfig = true;
			if (config.basepath){
				lithe.basepath = config.basepath;
			}
			// 改动,publicpath
			if (config.publicpath) {
				lithe.publicpath = config.publicpath;
			}
			lithe.config = config;
			CONFIGSTMAP = config.timestamp;
		};

		var Module = function(url) {
			this.id = url;
			this.status = 0;
			this.dependencies = [];
			this.exports = null;
			this.parent = [];
			this.factory = noop;
		};

		extend(Module.prototype, {
			_compile: function() {
				var mod = this;
				if (mod.status === STATUS.compiled){
					return mod.exports;
				}
				if (mod.status < STATUS.save){
					return null;
				}
				mod.status = STATUS.compiling;
				function require(id) {
					id = normalize(resolve(id), true);
					var child = lithe.cache[id];
					if (!child){
						return null;
					}
					if (child.status === STATUS.compiling){
						return child.exports;
					}
					child.parent = mod;
					return child._compile();
				}
				require.cache = lithe.cache;
				mod.require = require;
				mod.exports = {};
				var fun = mod.factory;
				if (isFunction(fun)){
					runModuleContext(fun, mod);
				}
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
				if(lithe.cache[url]){
					return lithe.cache[url];
				}else{
					lithe.cache[url] = new Module(url);
					return lithe.cache[url];
				}
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
			use: function(urls, cb) {
				if(!CONFIG || isInitConfig){
					realUse(urls, cb);
				}else{
					realUse(CONFIG, function(cg) {
						setConfig(cg);
						realUse(urls, cb);
					});
				}
			},
			load:getscript,
			setConfig:setConfig
		});

		if (CONFIG){
			CONFIG = createUrls(CONFIG);
		}


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