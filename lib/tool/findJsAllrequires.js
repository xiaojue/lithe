var fs = require('fs'),
path = require('path'),
uniq = require('./uniq'),
options = require('./options'),
commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
requireRegexp = /require\([\"|\'](.*?)[\"\|\']\)/g,
stack = {};

function _hasJsrequires(jsfile) {
	var requires = _getJsrequires(jsfile);
	return !! requires.length;
}

function _getJsrequires(jsfile) {
	var requires = [];
	if (fs.existsSync(jsfile)) {
		var file = fs.readFileSync(jsfile).toString().replace(commentRegExp, '');
		while ((result = requireRegexp.exec(file)) !== null) {
			requires.push(RegExp.$1);
		}
	}
	return requires;
}

function _isJsMapClear(stack) {
	for (var i in stack) {
		if (stack[i]) {
			delete stack[i];
			return i;
		}
	}
	return true;
}

function findJsAllrequires(jsfile, requires) {
	if (!requires) requires = [];
	var basepath = !! options.basepath ? options.basepath: path.dirname(jsfile),
	filerequires = _getJsrequires(jsfile);
	filerequires.map(function(require) {
		if (options.alias.hasOwnProperty(require)) require = options.alias[require];
		var file = path.resolve(basepath, require);
		if (path.extname(file) === '' || path.extname(file) !== '.js') file = file + '.js';
		return file;
	}).filter(function(require) {
		if (fs.existsSync(require)) return true;
		else {
			console.error(require + ' is not exits');
			return false;
		}
	}).forEach(function(file) {
		//增加判断文件是否存在的判断，不存在则剔除此依赖
		if (_hasJsrequires(file)) stack[file] = true;
		requires.push(file);
	});
	var over = _isJsMapClear(stack);
	if (over !== true) findJsAllrequires(over, requires);
	requires = uniq(requires);
	return requires;
}

module.exports = findJsAllrequires;

