/**
* @author fuqiang[designsor@gmail.com]
* @version 20111030
* @fileoverview 新版lithe,全部框架颗粒到函数与方法,使用全局代理与loader为基础实现。
*/

(function(W) {

	var lithe = (function(API) {

		var loader = {
			queue: [],
			mods: {}
		},
		typeDet = function() {
			var types = ["Array", "Object", "String", "Number"],
			ret = {};
			for (var i = 0; i < types.length; i++) {
				var type = types[i];
				ret['is' + type] = function(arg) {
					return Object.prototype.toString.call(arg) === "[object " + type + "]";
				}
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
		public = mix({},
		typeDet);

		loader.get = function(name, callback) {
				
		};

		mix(public, {
			each: each,
			mix: mix,
			extend: extend
		},
		false, true);

		each(API, function(index, api) {
			public[api] = function() {
				var arg = Array.prototype.slice.call(arguments, 0);
				loader.get(api, function(o) {
					o[api].apply(o, arg);
				});
			};
		});

		return public;

	})(['anim', 'io', 'event', 'ua', 'css', 'selector']);

	console.log(lithe);
})(window);

