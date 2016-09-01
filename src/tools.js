//tools function
var doc = global.document,
  Arr = Array.prototype,
  Obj = Object,
  toString = Obj.prototype.toString,
  commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
  jsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;

var isString = function(v) {
  return toString.call(v) === '[object String]';
};

var isFunction = function(v) {
  return toString.call(v) === '[object Function]';
};

var isArray = function(v) {
  return toString.call(v) === '[object Array]';
};

var isObject = function(v) {
  return v === Obj(v);
};

var forEach = Arr.forEach ? function(arr, fn) {
  arr.forEach(fn);
} : function(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    fn(arr[i], i, arr);
  }
};

var filter = Arr.filter ? function(arr, fn) {
  return arr.filter(fn);
} : function(arr, fn) {
  var ret = [];
  forEach(arr, function(item, i, arr) {
    if (fn(item, i, arr)) {
      ret.push(item);
    }
  });
  return ret;
};

var map = Arr.map ? function(arr, fn) {
  return arr.map(fn);
} : function(arr, fn) {
  var ret = [];
  forEach(arr, function(item, i, arr) {
    ret.push(fn(item, i, arr));
  });
  return ret;
};

var keys = Obj.keys ? Obj.keys : function(o) {
  var ret = [];
  for (var p in o) {
    if (o.hasOwnProperty(p)) {
      ret.push(p);
    }
  }
  return ret;
};

// 改动

var values = function(obj) {
  var values = [];

  function addValues(item) {
    values.push(item);
  }

  for (var pro in obj) {
    if (obj.hasOwnProperty(pro)) {
      if (isArray(obj[pro])) {
        forEach(obj[pro], addValues);
      } else {
        addValues(obj[pro]);
      }
    }
  }
  return values;
};

var indexOf = Arr.indexOf ? function(arr, selector) {
  return arr.indexOf(selector);
} : function(arr, selector) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === selector) {
      return i;
    }
  }
  return -1;
};

var getByTagName = function(tag, ele) {
  ele = ele || doc;
  return ele ? ele.getElementsByTagName(tag) : ele;
};

var noop = function() {};

var getAttr = function(ele, ns) {
  return ele.getAttribute(ns);
};

var extend = function(source, options) {
  for (var i in options) {
    if (options.hasOwnProperty(i)) {
      source[i] = options[i];
    }
  }
  return source;
};


var unique = function unique(arr) {
  var o = {};
  forEach(arr, function(item) {
    o[item] = 1;
  });
  return keys(o);
};

var attr = function attr(node, ns) {
  return node.getAttribute(ns);
};

//处理依赖部分
var getDependencies = function(code) {
  var deps = [];
  code.replace(commentRegExp, '').replace(jsRequireRegExp, function(match, dep) {
    deps.push(dep);
  });
  return unique(deps);
};

var runModuleContext = function(fn, mod) {
  var ret = fn(mod.require, mod.exports, mod);
  if (ret !== undef) {
    mod.exports = ret;
  }
};
