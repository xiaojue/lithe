var walk = require('./walk'),
fs = require('fs');

function delSync(p) {
	walk(p, {
		cb: function(files, dirs) {
			var c = 0;
			while ((c = files.shift())) {
				if (/\.svn|\.git/.test(c)) continue;
				try {
					fs.unlinkSync(c);
				} catch(e) {}
			}
			while ((c = dirs.pop())) {
				try {
					if (/\.svn|\.git/.test(c)) continue;
					fs.rmdirSync(c);
				} catch(e) {}
			}
		}
	});
}

module.exports = delSync;

