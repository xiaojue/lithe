
var header = doc.head || getByTagName('head')[0] || doc.documentElement,
CHARSET = 'utf-8',
scripts = getByTagName('script'),
currentJs = scripts[scripts.length - 1],
currentPath = currentJs.src || attr(currentJs, 'src'),
BASEPATH = attr(currentJs, 'data-path') || currentPath,
CONFIG = attr(currentJs, 'data-config'),
DEBUG = attr(currentJs, 'data-debug') === 'true',
GLOBALTIMESTAMP = getTimeStamp(currentJs.src),
CONFIGSTMAP = null,
mainjs = attr(currentJs, 'data-main'),

fetching = {},
callbacks = {},
fetched = {};

BASEPATH = (BASEPATH === currentPath) ? dirname(currentPath) : resolve(BASEPATH,dirname(currentPath));

var fetch = function(url, cb) {
  LEVENTS.trigger('fetch', [url, cb]);
};

LEVENTS.on('fetch', function(url, cb) {
  if (! (/\.css$/).test(url)) {
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
});

var getscript = function(url, cb, charset) {
  var node = createNode('script', charset);
  node.onload = node.onerror = node.onreadystatechange = function() {
    if (/loaded|complete|undefined/.test(node.readyState)) {
      node.onload = node.onerror = node.onreadystatechange = null;
      if (node.parentNode && ! DEBUG){
        node.parentNode.removeChild(node);
      }
      node = undef;
      if (isFunction(cb)){
        cb();
      }
    }
  };
  node.async = 'async';
  var timestamp = CONFIGSTMAP ? CONFIGSTMAP : GLOBALTIMESTAMP;
  url = timestamp ? url + '?timestamp=' + timestamp : url;
  node.src = url;
  insertscript(node);
};

var createNode = function(tag, charset) {
  var node = doc.createElement(tag);
  if (charset){
    node.charset = charset;
  }
  return node;
};

var insertscript = function(node) {
  var baseElement = getByTagName('base', header)[0];
  if(baseElement){
    header.insertBefore(node, baseElement);
  }else{
    header.appendChild(node);
  }
};

