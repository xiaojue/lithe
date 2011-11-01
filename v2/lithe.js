/**
* @author fuqiang[designsor@gmail.com]
* @version 20111030
* @fileoverview 新版lithe,全部框架颗粒到函数与方法,使用全局代理与loader为基础实现。
*/

(function(W, DOC, undef) {

	var lithe = (function(API) {

		var typeDet = function() {
			var types = ["Array", "Object", "String", "Number"],
			ret = {};
			for (var i = 0; i < types.length; i++) { (function(i) {
					var type = types[i];
					ret['is' + type] = function(arg) {
						return Object.prototype.toString.call(arg) === "[object " + type + "]";
					}
				})(i);
			}
			return ret;
		} (),
		each = function(arg, callback) {
			for (var i in arg) {
				if (callback(i, arg[i]) === false) break;
			}
		},
		mix = function(o, s, cover, deep) {
			each(s, function(i, v) {
				if (!deep) {
					if (!o.hasOwnProperty(i) || cover) o[i] = v;
				} else {
					if (!o.hasOwnProperty(i) || cover) {
						if (typeDet.isObject(v)) {
							mix(o, v, cover, deep);
						} else {
							o[i] = v;
						}
					}
				}
			});
			return o;
		},
		extend = function(r, s, px, sx) {
			if (!s || ! r) return r;
			var create = Object.create ? function(proto, c) {
				return Object.create(proto, {
					constructor: {
						value: c
					}
				});
			}: function(proto, c) {
				function F() {}
				F.prototype = proto;
				var o = new F();
				o.constructor = c;
				return o;
			},
			sp = s.prototype,
			rp;
			rp = create(sp, r);
			r.prototype = mix(rp, r.prototype);
			r.superclass = create(sp, s);
			if (px) {
				mix(rp, px);
			}
			if (sx) {
				mix(r, sx);
			}
			return r;
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
					//console.log('interval')
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
						}); //callback 按照顺序释放
						clearInterval(timer);
					}
				},
				10);
			},
			require: function(api, callback, debug) {
				var that = this,
				filename = debug ? debug: '.js';
				url = root + '/' + api + '/' + api + filename;

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
						that.queue.push({
							api: val,
							ready: false
						});
						that.require(val, function() {
							done(val)
						},
						debug);
					});
				}
				that._firequeue(callback);
			},
			define: function(api, source, requires) {
				this.mods[api] = {};
				this.mods[api]['requires'] = requires ? requires: {};
				this.mods[api]['source'] = source;
				each(this.queue, function(index, o) {
					if (o['api'] == api) {
						o['ready'] = true;
						return false;
					}
				});
			}
		},
		public = mix({},
		typeDet);

		mix(public, {
			each: each,
			mix: mix,
			extend: extend,
			getResoure: get
		},
		false, true);

		each(API, function(index, api) {
			public[api] = function() {
				var arg = Array.prototype.slice.call(arguments, 0);
				loader.require(api, function() {
					public['namespace'][api].apply(public, arg);
				});
			};
		});

		mix(public, loader);

		return public;

	})(['anim', 'io', 'event', 'ua', 'css', 'selector', 'jquery']);

	window.lithe = lithe;

})(window, document);

