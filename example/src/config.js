(function(global, undef) {
	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	var debug;
	var basepath,
			publicpath;
	if (isBrowser) {
		debug = (/debug/).test(location.search);
		basepath = location.href.slice(0, location.href.lastIndexOf('/'));

		// 改动,根据实际配置

		publicpath = "http://localhost:8081";
	}
	var mod = {
		basepath: debug ? basepath + '/src/': basepath + '/assest/',
		alias: {
			"markdown": "mods/markdown"
		},

		// 改动,根据实际src/dist 路径配置

		publicpath : debug ? publicpath + "/public/src/" : publicpath + "/public/src/",
		publicdeps : {
				"vendors/zepto" : {
					"vendors/v1/zepto.js" : []
				},
				"vendors/zepto-fx.js" : {
					"vendors/zepto-fx.js" : []
				},
			  "vendors/lazyload.js" : {
					"vendors/lazyload.js" : ["vendors/zepto", "vendors/zepto-fx.js"]
				}
		}
	};
	if (global.define && isBrowser) {
		define('config', function() {
			return mod;
		});
	} else {
		module.exports = mod;
	}
})(this);

