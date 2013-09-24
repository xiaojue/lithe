var options = require('./options'),
exec = require('child_process').exec;

function uglifyJs(jsfile, target, cb) {
	if (options.uglifyPath) {
		exec('node '+options.uglifyPath + ' --no-copyright --reserved-names require -o ' + target + ' ' + jsfile, function() {
			if (typeof cb == 'function') cb();
		});
	} else {
		console.log('uglifyPath must be set');
	}
}

module.exports = uglifyJs;

