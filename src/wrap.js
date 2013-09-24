/**
* @author {{author}}
* @fileoverview {{fileoverview}}
* @version {{version}}
*/
(function(global, undef) {
	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	if (isBrowser) {
		//include tools.js
	    //include event.js
		//include path.js
		//include fetch.js
		//include module.js
		global.lithe = module;
		global.define = lithe.define;
		if (mainjs) global.lithe.use(mainjs);
	} else {
		exports.tool = require('./lib/lithe-tool.js');
		exports.hfs = require('./lib/lithe-hfs.js');
	}
})(this);

