/**
* @author fuqiang[designsor@gmail.com]
* @version 20111030
* @fileoverview 新版lithe,全部框架颗粒到函数与方法,使用全局代理与loader为基础实现。
* api设计部分:
* 类型检测
* 加载模块（js 和 css）
* 数据交互（json 和 jsonp）
*/

(function(W, DOC, undef) {

	var publicObjectObejct,
    lithe = (function(API) {
		var each = function(arg, callback) {
			for (var i in arg) {
				if (callback(i, arg[i]) === false) break;
			}
		},
		lang = function() {
			var types = ["Array", "Object", "String", "Number", "Function"],
			ret = {
				isTypeof: function(o) {
					return Object.prototype.toString.call(o);
				},
				isEmptyArray: function(array) {
					return (lang.isArray(array) && array.length === 0);
				},
				isEmptyObject: function(object) {
					if (!lang.isObject(object)) return false;
					for (var i in object) return false;
					return true;
				},
				isEqual: function(s, o) {
					if (lang.isTypeof(s) !== lang.isTypeof(o)) return false;

					if (!lang.isArray(s) && ! lang.isObject(s) && ! lang.isArray(o) && ! lang.isObject(o)) return s === o; //严格类型
					if (lang.isFunction(s) && lang.isFunction(o)) return s.toString() === o.toString();

					for (var i in s) {
						if (o[i] && ! lang.isArray(o[i]) && ! lang.isObject(o[i]) && lang.isTypeof(o[i]) === lang.isTypeof(s[i]) && o[i] === s[i] || ((isEmptyObject(s[i]) && isEmptyObject(o[i])) || (isEmptyArray(s[i]) && isEmptyArray(o[i])))) {
							continue;
						} else {
							return isEqual(s[i], o[i]);
						}
					}
					return true;
				},
				inArray: function(array, val) {
					for (var i = 0; i < array.length; i++) {
						if (lang.isEqual(array[i], val)) return true;
					}
					return false;
				}
			};
			each(types, function(index, type) {
				ret['is' + type] = function(arg) {
					return ret.isTypeof(arg) === "[object " + type + "]";
        };
      });
			return ret;
		} (),
		mix = function(o, s, cover, deep) {
			each(s, function(i, v) {
				if (!deep) {
					if (!o.hasOwnProperty(i) || cover) o[i] = v;
				} else {
					if (!o.hasOwnProperty(i) || cover) {
						if (lang.isObject(v) && ! lang.isEmptyObject(v)) {
							mix(o, v, cover, deep);
						} else {
							o[i] = v;
						}
					}
				}
			});
			return o;
		},
		root = function() {
			var files = DOC.getElementsByTagName('script'),
			self = files[files.length - 1],
			src = self.src,
			lastbackslash = src.lastIndexOf('/');
			return src.substring(0, lastbackslash);
		} (),
		get = function(url, type, callback, charset) {
			var jsReady, cssReady, ele, _fn = {
				'js': function() {
					ele = DOC.createElement('script');
					ele.setAttribute('type', 'text/javascript');
					ele.setAttribute('src', url);
					ele.setAttribute('async', true);
					ele.onload = ele.onreadystatechange = function() {
						if (!this.readyState || this.readyState === 'loader' || this.readyState === 'complete') {
							if (callback) callback();
							ele.onload = ele.onreadystatechange = null;
						}
          };
				},
				'css': function() {
					ele = DOC.createElement('link');
					ele.setAttribute('type', 'text/css');
					ele.setAttribute('rel', 'stylesheet');
					ele.setAttribute('href', url);
					cssReady = new Image();
					img.onerror = function() {
						if (callback) callback();
						img.onerror = null;
						img = null;
          };
					img.src = url;
				}
			};
			_fn[type]();
			if (charset) ele.charset = charset;
			DOC.getElementsByTagName('head')[0].appendChild(ele);
		},
		loader = {
			queue: [],
			queuefn: [],
			mods: {},
			namespace: {},
			_firequeue: function(fn) {
				var that = this;
				function checkready(ary) {
					var isReady = true;
					each(ary, function(index, o) {
						if (!o['ready']) {
							isReady = false;
							return false;
						}
					});
        return isReady;
				}
				that.queuefn.push(fn);
				var timer;
				timer = setInterval(function() {
					if (checkready(that.queue)) {
						while (that.queuefn.length !== 0) {
							var i = 0;
							that.queuefn[i]();
							that.queuefn.shift();
						}
						clearInterval(timer);
					}
				},
				50);
			},
			require: function(api, callback) {
				var that = this,
				name = api.name,
				url = api.path;

				function has(ary, val) {
					var ishas = false;
					each(ary, function(index, o) {
						if (o['api'] == val) {
							ishas = true;
							return false;
						}
					});
					return ishas;
				}

				if (!has(that.queue, name)) {
					get(url, 'js', function() {
              done(name);
					});
					that.queue.push({
						api: name,
						ready: false
					});
				}

				function done(name) {
					each(that.mods[name]['requires'], function(index, val) {
						that.require(val, function() {
                done(val);
						});
					});
				}
				that._firequeue(callback);
			},
			define: function(api, source, requires) {
				var that = this;
				var _api = {
					name: '',
					path: '',
					csspath: '',
					version: '',
					author: '',
					fileoverview: ''
				};
				mix(_api, api, true);
				var name = _api['name'];
				that.mods[name] = {};
				that.mods[name]['requires'] = requires ? requires: [];
				that.mods[name]['source'] = source;
				each(that.queue, function(index, o) {
					if (o['api'] == name) {
						o['ready'] = true;
						that['namespace'][name] = that.mods[name]['source']();
						return false;
					}
				});
			}
		},
		use = function(mods, callback) {
			var APIS = [];
			each(mods, function(i, mod) {
				each(API, function(j, api) {
					var name = api.name;
					if (name === mod) {
						publicObjectObejct.require(api, function() {
							APIS.push(publicObjectObejct['namespace'][name]);
							if (APIS.length == mods.length) {
								callback.apply(null, APIS);
							}
						});
					}
				});
			});
		};


		mix(publicObject, {
			each: each,
			mix: mix,
			getScript: function(url, callback, charset) {
				get(url, 'js', callback, charset);
			},
			getCss: function(url, callback, charset) {
				get(url, 'css', callback, charset);
			},
			loader: loader,
			use: use
		},
		false, true);

		mix(publicObject, {
			lang: lang
		});

		each(API, function(index, api) {
			var name = api.name;
			publicObject[name] = function(callback) {
				publicObject.require(api, function() {
					callback(publicObject['namespace'][name]);
				});
			};
		});

		return publicObject;

	})([{
		name: 'dom',
		path: 'dom/dom.js'
	},
	{
		name: 'event',
		path: 'event/event.js'
	},
	{
		name: 'anim',
		path: 'anim/anim.js'
	},
	{
		name: 'ua',
		path: 'ua/ua.js'
	},
	{
		name: 'css',
		path: 'css/css.js'
	},
	{
		name: 'io',
		path: 'io/io.js'
	},
	{
		name: 'tools',
		path: 'tools/tools.js'
	},
	{
		name: 'jquery',
		path: 'jquery/jquery.js'
	}]);

	W.lithe = lithe;

})(window, document);
