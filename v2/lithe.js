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

	var lithe = (function(API) {
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
					return (lang.isArray(array) && array.length == 0);
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
					};
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
				}
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
					}
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
					}
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
				};
				that.queuefn.push(fn);
				var timer;
				timer = setInterval(function() {
					console.log('interval')
					if (checkready(that.queue)) {
						each(that.queue, function(index, o) {
							if (!that.mods[o['api']]['fired']) {
								//console.log(o['api'])
								that.mods[o['api']]['source']();
								that.mods[o['api']]['fired'] = true;
							}
						}); //api按照顺序释放
						each(that.queuefn, function(index, fn) {
							that.queuefn.splice(index, 1, undef);
							if (fn) fn();
							else that.queuefn.splice(index, 1);
						}); //callback 按照顺序释放
						clearInterval(timer);
					}
				},
				1000);
			},
			require: function(api, callback) {
				var that = this,
				url = root + '/' + api + '/' + api + '.js';

				function has(ary, val) {
					var ishas = false;
					each(ary, function(index, o) {
						if (o['api'] == val) {
							ishas = true;
							return false;
						};
					});
					return ishas;
				}

				if (!has(that.queue, api)) {
					get(url, 'js', function() {
						done(api)
					});
					that.queue.push({
						api: api,
						ready: false
					});
				}

				function done(name) {
					each(that.mods[name]['requires'], function(index, val) {
						that.require(val, function() {
							done(val)
						});
					});
				}
				that._firequeue(callback);
			},
			define: function(api, source, requires) {
				this.mods[api] = {};
				this.mods[api]['requires'] = requires ? requires: [];
				this.mods[api]['source'] = source;
				each(this.queue, function(index, o) {
					if (o['api'] == api) {
						o['ready'] = true;
						return false;
					}
				});
			}
		};

		var public = {};

		mix(public, {
			each: each,
			mix: mix,
			getScript: function(url, callback, charset) {
				get(url, 'js', callback, charset);
			},
			getCss: function(url, callback, charset) {
				get(url, 'css', callback, charset);
			},
			loader: loader
		},
		false, true);

		mix(public, {
			lang: lang
		});

		each(API, function(index, api) {
			public[api] = function() {
				var arg = Array.prototype.slice.call(arguments, 0);
				public.require(api, function() {
					public['namespace'][api].apply(public, arg);
				});
			};
		});

		return public;

	})(['anim', 'io', 'event', 'ua', 'css', 'selector', 'jquery']);

	W.lithe = lithe;

})(window, document);

