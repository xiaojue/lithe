var fs = require('fs'),
path = require('path');

function mkdirSync(p) {
	p = path.normalize(p);
	var array = p.split(path.sep); //创建目录,没有则补上
	for (var i = 0, cur; i < array.length; i++) {
		if (i === 0) cur = array[i];
		else cur += (path.sep + array[i]);
		try {
			fs.mkdirSync(cur, "0755");
		} catch(e) {}
	}
}

module.exports = mkdirSync;
