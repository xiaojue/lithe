var fs = require('fs'),
    path = require('path'),
    mkdirSync = require('./mkdirSync');

function inner(old, neo) {
	var array = fs.readdirSync(old);
	for (var i = 0, n = array.length; i < n; i++) {
		if (/\.svn|\.git/.test(array[i])) continue;
		var source = path.resolve(old, array[i]);
		var target = path.join(neo, source.replace(old, ""));
		var stat = fs.statSync(source); //判定旧的IO对象的属性，是目录还是文件或是快捷方式
		if (stat.isDirectory()) {
			if (!fs.existsSync(target)) { //创建新文件
				mkdirSync(target);
			}
			inner(source, target);
		} else if (stat.isSymbolicLink()) {
			fs.symlinkSync(fs.readlinkSync(source), target);
		} else {
			fs.writeFileSync(target, fs.readFileSync(source));
		}
	}
}

function cpdirSync(old, neo) {
	old = path.resolve(process.cwd(), old);
	neo = path.resolve(process.cwd(), neo); //允许拷贝到另一个分区中
	if (!fs.existsSync(neo)) { //创建新文件
		mkdirSync(neo);
	}
	inner(old, neo);
}

module.exports = cpdirSync;
