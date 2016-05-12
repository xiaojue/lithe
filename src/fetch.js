var header = doc.head || getByTagName('head')[0] || doc.documentElement,
scripts = getByTagName('script'),
currentJs = scripts[scripts.length - 1],
currentPath = currentJs.src || attr(currentJs, 'src'),
BASEPATH = attr(currentJs, 'data-path') || currentPath,
CONFIG = attr(currentJs, 'data-config'),
CHARSET = attr(currentJs, 'charset') || 'utf8',
DEBUG = attr(currentJs, 'data-debug') === 'true',
DYNAMICCONFIG = attr(currentJs,'data-config-dynamic') === 'true',
GLOBALTIMESTAMP = getTimeStamp(currentJs.src),
CONFIGSTMAP = null,
mainjs = attr(currentJs, 'data-main'),

fetching = {},
callbacks = {},
fetched = {},
publicDeps = [], // 改动,增加public依赖数组;
jsExt = ".js"; // 改动,js后缀

BASEPATH = (BASEPATH === currentPath) ? dirname(currentPath) : resolve(BASEPATH, dirname(currentPath));

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

var loadeds = {};

var getscript = function(urls, cb, charset) {
  var url = isArray(urls) ? urls.shift() : urls;
  function success() {
    if (isArray(urls) && urls.length) {
      getscript(urls, cb, charset);
    } else {
      if (isFunction(cb)) {
        cb();
      }
    }
  }
  if (loadeds[url]) {
    success();
    return;
  }
  if (url) {
    var node = createNode('script', charset);
    node.onload = node.onerror = node.onreadystatechange = function() {
      if (/loaded|complete|undefined/.test(node.readyState)) {
        node.onload = node.onerror = node.onreadystatechange = null;
        if (node.parentNode && ! DEBUG) {
          node.parentNode.removeChild(node);
        }
        node = undef;
        loadeds[url] = true;
        success();
      }
    };
    node.async = 'async';
    var timestamp;
    if(DYNAMICCONFIG){
      timestamp = CONFIGSTMAP ? CONFIGSTMAP : new Date().valueOf();
    }else{
      timestamp = CONFIGSTMAP ? CONFIGSTMAP : GLOBALTIMESTAMP;
    }
    url = timestamp ? url + '?timestamp=' + timestamp: url;
    node.src = url;
    insertscript(node);
  } else {
    throw new Error('getscript url is ' + url);
  }
};

var createNode = function(tag, charset) {
  var node = doc.createElement(tag);
  node.charset = charset ? charset: CHARSET;
  return node;
};

var insertscript = function(node) {
  var baseElement = getByTagName('base', header)[0];
  if (baseElement) {
    header.insertBefore(node, baseElement);
  } else {
    header.appendChild(node);
  }
};

