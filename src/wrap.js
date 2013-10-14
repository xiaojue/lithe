(function(global, undef) {
	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	if (isBrowser) {
		include "tools.js"
		include "event.js"
		include "path.js"
		include "fetch.js"
		include "module.js"
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

