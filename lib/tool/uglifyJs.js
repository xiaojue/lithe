var options = require('./options'),
path = require('path'),
exec = require('child_process').exec;

function uglifyJs(jsfile, target, cb) {
	if (!options.uglifyPath) {
		options.uglifyPath = path.resolve(__dirname,'../../node_modules/uglify-js/bin/uglifyjs');
	}
	//console.log('node ' + options.uglifyPath + ' --no-copyright -c -m -r "require" -o ' + target + ' ' + jsfile);
	exec('node ' + options.uglifyPath + ' --no-copyright -c -m -r "require" -o ' + target + ' ' + jsfile, function() {
		if (typeof cb == 'function') cb();
	});
}

module.exports = uglifyJs;

