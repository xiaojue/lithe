var fs = require('fs'),
hfs = require('../lithe-hfs.js');

function concatFile(files, target) {
	var ret = '';
	files.forEach(function(file) {
		if (fs.existsSync(file)) {
			ret += fs.readFileSync(file) + '\r\n';
		}
	});
	hfs.writeFileSync(target, ret);
}

module.exports = concatFile;
