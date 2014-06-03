var fs = require('fs'),
path = require('path'),
uniq = require('./uniq'),
options = require('./options'),
commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
requireRegexp = /require\([\"|\'](.*?)[\"\|\']\)/g,
stack = {};


function replaceDir(id) {
	//只替换一次,且如果路径包含2个dir，也只替换一次,并且只匹配第一个，之后的不匹配
	// UI:../ -> UI/test = ../test
	// UI:../ -> UI/UI/test = ../UI/test
	// UI:../ -> ../a/UI/test = ../a/UI/test [不会替换]
	// UI:../ -> a/UI/test = a/UI/test [不会替换]
	var locks = {},
	directorys = options.directorys || [],
	k, path, reg, dir, j;
	for (k = 0; k < directorys.length; k++) {
		if (locks[id]) break;
		dir = directorys[k];
		for (j in dir) {
			path = dir[j];
			reg = new RegExp("^" + j + "\/");
			if (reg.test(id) && ! locks[id]) {
				id = id.replace(reg, path);
				locks[id] = true;
				break;
			}
		}
	}
	return id;
}

function replaceId(id) {
	var alias = options.alias;
	if (alias) {
		var newid = alias[id];
		return newid ? newid: replaceDir(id);
	}
	return id;
}


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

function findJsAllrequires(jsfile, requires,filter) {
	if (!requires) requires = [];
	var basepath = !! options.basepath ? options.basepath: path.dirname(jsfile),
	filerequires = (filter && !filter(jsfile)) ? [] : _getJsrequires(jsfile);
	filerequires.filter(function(require){
		if(filter && filter(require)) return false;
        if(path.extname(require) == '.css') return false;
        return true;
    }).map(function(require) {
        require = require.lastIndexOf('?') > -1 ? require.slice(0,require.lastIndexOf('?')): require;
        require = replaceId(require);
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
	if (over !== true) findJsAllrequires(over, requires,filter);
	requires = uniq(requires);
	return requires;
}

module.exports = findJsAllrequires;

