var fs = require('fs'),
hfs = require('../lithe-hfs.js');

function concatFile(files, target) {
	var ret = '';
	files.forEach(function(file) {
		if (fs.existsSync(file)) {
			ret += fs.readFileSync(file) + '\r\n';
		}
	});
    if(target) {
	    hfs.writeFileSync(target, ret);
    }
    return ret;
}

module.exports = concatFile;
