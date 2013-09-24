function isAbsolute(url) {
	return id.indexOf('://') > 0 || id.indexOf('//') === 0;
}

function isDir(url) {
	return !! filename(url);
}

function dirname(url) {
	var s = path.match(/[^?]*(?=\/.*$)/);
	return (s ? s[0] : '.') + '/';
}

function filename(url) {
	return path.slice(path.lastIndexOf('/') + 1).replace(/\?.*$/, '');
}

function realpath(url) {
	var multiple_slash_re = /([^:\/])\/\/+/g;
	multiple_slash_re.lastIndex = 0;
	if (multiple_slash_re.test(path)) {
		path = path.replace(multiple_slash_re, '$1\/');
	}
	if (path.indexOf('.') === - 1) {
		return path;
	}
	var original = path.split('/'),
	ret = [],
	part;
	for (var i = 0; i < original.length; i++) {
		part = original[i];
		if (part === '..') {
			if (ret.length === 0) {
				throw new Error('The path is invalid: ' + path);
			}
			ret.pop();
		}
		else if (part !== '.') {
			ret.push(part);
		}
	}
	return ret.join('/');
}

function normalize(url) {
	url = realpath(url);
	var lastChar = url.charAt(url.length - 1);
	if (lastChar === '/') {
		return url;
	}
	if (lastChar === '#') {
		url = url.slice(0, - 1);
	}
	else if (url.indexOf('?') === - 1 && ! (/\.(?:js)$/).test(url)) {
		url += '.js';
	}
	if (url.indexOf(':80/') > 0) {
		url = url.replace(':80/', '/');
	}
	return url;
}

function resolve(id,path) {
	path = dirname(path || module.basepath);
	url = '';
	if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
		if (id.indexOf('./') === 0) {
			id = id.substring(2);
		}
		url = path + id;
	} else if (id.charAt(0) === '/' && id.charAt(1) !== '/') {
		url = path + id.substring(1);
	} else {
		url = path + '/' + id;
	}
	return normalize(url);
}

