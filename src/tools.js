//tools function
var doc = global.document,
Arr = Array.prototype,
Obj = Object,
toString = Obj.prototype.toString,
commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
jsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;

var forEach = Arr.forEach ? function(arr, fn) {
	arr.forEach(fn);
}: function(arr, fn) {
	for (var i = 0; i < arr.length; i++) fn(arr[i], i, arr);
};

var filter = Arr.filter ? function(arr, fn) {
	return arr.filter(fn);
}: function(arr,fn) {
	var ret = [];
	forEach(arr, function(item, i, arr) {
		if (fn(item, i, arr)) ret.push(item);
	});
	return ret;
};

var map = Arr.map ? function(arr, fn) {
	return arr.map(fn);
}: function(arr, fn) {
	var ret = [];
	forEach(arr, function(item, i, arr) {
		ret.push(fn(item, i, arr));
	});
	return ret;
};

var keys = Obj.keys ? Obj.keys: function(o) {
	var ret = [];
	for (var p in o) {
		if (o.hasOwnProperty(p)) ret.push(p);
	}
	return ret;
};

var indexOf = Arr.indexOf ? function(arr, selector) {
	return arr.indexOf(selector);
}: function(arr, selector) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === selector) return i;
	}
	return - 1;
};
function getByTagName(tag, ele) {
	ele = ele || doc;
	return ele ? ele.getElementsByTagName(tag) : ele;
}

function noop() {}

function getAttr(ele, ns) {
	return ele.getAttribute(ns);
}

function extend(source, options) {
	for (var i in options) {
		if (options.hasOwnProperty(i)) source[i] = options[i];
	}
	return source;
}

function isString(v) {
	return toString.call(v) === '[object String]';
}

function isFunction(v) {
	return toString.call(v) === '[object Function]';
}

function isObject(v) {
	return v === Obj(v);
}

function unique(arr) {
	var o = {};
	forEach(arr, function(item) {
		o[item] = 1;
	});
	return keys(o);
}

function attr(node, ns) {
	return node.getAttribute(ns);
}

//处理依赖部分
function getDependencies(code) {
	var deps = [];
	code.replace(commentRegExp, '').replace(jsRequireRegExp, function(match, dep) {
		deps.push(dep);
	});
	return unique(deps);
}

function runModuleContext(fn, mod) {
	var ret = fn(mod.require, mod.exports, mod);
	if (ret !== undef) mod.exports = ret;
}

