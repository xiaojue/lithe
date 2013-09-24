var header = doc.head || getByTagName('head')[0] || doc.documentElement,
CHARSET = 'utf-8',
scripts = getByTagName('script'),
currentJs = scripts[scripts.length - 1],
BASEPATH = attr(currentJs, 'data-path') || currentJs.src || attr(currentJs, 'src'),
CONFIG = attr(currentJs, 'data-config'),
DEBUG = attr(currentJs, 'data-debug') === 'true',
mainjs = attr(currentJs, 'data-main'),

fetching = {},
callbacks = {},
fetched = {};

function fetch(url, cb) {
	if (fetched[url]) {
		cb();
		return;
	}
	if (fetching[url]) {
		callbacks[url].push(cb);
		return;
	}
	fetching[url] = true;
	callbacks[url] = [cb];
	getscript(url, function() {
		fetched[url] = true;
		delete fetching[url];
		var fns = callbacks[url];
		if (fns) {
			delete callbacks[url];
			forEach(fns, function(fn) {
				fn();
			});
		}
	},
	CHARSET);
}

function getscript(url, cb, charset) {
	var node = createNode('script', charset);
	node.onload = node.onerror = node.onreadystatechange = function() {
		if (/loaded|complete|undefined/.test(node.readyState)) {
			node.onload = node.onerror = node.onreadystatechange = null;
			if (node.parentNode && !DEBUG) node.parentNode.removeChild(node);
			node = undef;
			if (isFunction(cb)) cb();
		}
	};
    node.async = 'async';
    node.src = url;
    insertscript(node);
}

function createNode(tag, charset) {
	var node = doc.createElement(tag);
	if (charset) node.charset = charset;
	return node;
}

function insertscript(node) {
	var baseElement = getByTagName('base', header)[0];
	baseElement ? header.insertBefore(node, baseElement) : header.appendChild(node);
}

