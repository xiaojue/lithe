(function(global, undef) {
	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	var debug;
	var basepath;
	if (isBrowser) {
		debug = (/debug/).test(location.search);
		basepath = location.href.slice(0, location.href.lastIndexOf('/'));
	}
	var mod = {
		basepath: debug ? basepath + '/src/': basepath + '/assest/',
		alias: {
			"markdown": "mods/markdown"
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

