var fs = require('fs'),
path = require('path'),
mkdirSync = require('./mkdirSync');

function writeFileSync(p, data, encoding) {
	p = path.normalize(p);
	var i = p.lastIndexOf(path.sep),
	dir = p.slice(0, i);
	encoding = encoding || "utf8";
	if (dir) mkdirSync(dir, "0755");
	fs.writeFileSync(p, data, encoding);
}

module.exports = writeFileSync;
