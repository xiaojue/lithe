var path = require('path'),
debug = true;
var litheRequire = function(id) {
	if (debug) {
		var filename = path.resolve(process.cwd(), id);
		if (require.cache.hasOwnProperty(filename)) delete require.cache[filename];
		return require(id);
	}
	return require(id);
};

exports.require = litheRequire;

