# Lithe
[![Build Status](https://travis-ci.org/litheModule/lithe.png?branch=master)](https://travis-ci.org/litheModule/lithe) [![依赖模块状态](https://david-dm.org/litheModule/lithe.png)](http://david-dm.org/litheModule/lithe)
[![浏览数](https://sourcegraph.com/api/repos/github.com/litheModule/lithe/counters/views.png?no-count)](https://sourcegraph.com/github.com/litheModule/lithe)


A browser-side script loader,compatible with the de facto standards(NodeJS/CommonJS).
It's very simple and small,only 2.7kb gzipped.

If you use Gruntjs to build your project , you can use [grunt-lithe][1]

You can use [bower][2] manage modules Easier.

Chinese Documentation [中文文档][3]

  [1]: http://www.github.com/litheModule/grunt-lithe
  [2]: https://github.com/bower/bower
  [3]: https://github.com/litheModule/lithe/blob/master/document/ZH.md

---

## Installation

```bash
$ npm install lithe -g
$ git clone https://github.com/litheModule/lithe
$ cd lithe
$ npm install -d
```

---

## command tools

---

```bash
$ lithe 

  Usage: lithe [options] [command]

  Commands:

    build <source> <target> build source to target
    compress <source> <target> compress source to target
    getpackage <source> <target> get source requires to target package

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -c, --config <path>  set the config file,it will be return alias and basepath
    
```

---

## public api for browser

### define

```js
//path/to/file.js
define('path/to/file',function(require,exports,module){
  var file = 'path/to/file.js';
  exports.filename = 'file.js';
  exports.filedir = 'path/to/';
  /**
   * module.exports = {
   *    filename:'file.js',
   *    filedir:'path/to'
   * };
   */
});

```

### require

```js
//path/to/app.js
define('path/to/app',function(require,exports,module){
  var file = require('path/to/file');
  console.log(file.filename); //file.js
  console.log(file.filedir) //path/to
  module.exports = 'i am app.js';
});
```
### lithe.use

```js
//anywhere
lithe.use('path/to/app',function(app){
    console.log(app); // i am app.js
});
//or
lithe.use('a.js','b.js',function(a,b){
  //a and b has required;
});
```

### config

```js
define('config',function(require,exports,module){
   module.exports = {
      //it will replace the real BASEPATH
      basepath:'http://localhost/debug/path', 
      //logogram
      alias:{
        'app':'path/to/app',
        'file':'path/to/file',
        //Relative directory proxy
        'UI':'../'
      }
   };
});

define('someOtherJs',function(){
  var app = require('app'),
  file = require('file');
});
```

## public api for node

```js
//npm install lithe
var lithe = require('lithe'),
tool = lithe.tool,
hfs = lithe.hfs,
options = tool.options;

options.basepath = 'your project base dir';
options.uglifyPath = 'your uglifyjs dir';
options.alias = {}; //your short alias config

```

### tool.findJsAllrequires([filepath]) 

```js
var requires = tool.findJsAllrequires('../app.js');
//app.js's requires are findout and alias will be replaced  
```
### tool.concatFile([files],[target])

```js
tool.concatFile(['/path/to/file1.js','/path/to/file2.js'],'/path/to/file1&file2.js');
//file1 and file2 will be merger
```

### tool.uglifyJs([filepath],[target])

```js
tool.uglifyJs('/path/to/file1&file2.js','path/to/file1&file2-min.js');
//Equivalent uglifyjs --reserved-names require -o path/to/file1&file2-min.js /path/to/file1&file2.js
```

### hfs.cpdirSync([sourceDir],[targetDir])

```js
hfs.cpdirSync('/path/to/dir1','/path/to/dir2');
//copy the folder by sync,if targetDir not exist it will be created.
//.git and .svn will be continue.
```

### hfs.delSync([path])

```js
hfs.delSync('/path/to/dir');
hfs.delSync('/path/to/file');
//del the folder or file sync
//.git and .svn will be continue.
```

### hfs.mkdirSync([target])

```js
hfs.mkdirSync('/path/dir')
//if the '/path' folder not exist,it will be created.
```

### hfs.walk([path],[callback],[options])

```js
hfs.walk('/path/',function(files){
    console.log(files); 'return path folder all js files';    
},{
    filter:function(file){
	  if (path.extname(el).indexOf('.js') > - 1) return true;
    }
});
//it's worked sync
```

### hfs.writeFileSync([filepath],[data],[encoding = utf8])

```js
hfs.writeFileSync('/path/file',"abcd");
//if path folder not exist,it will be created.
```

## How to deploy in the web browser？

```html
<script src="lithe.js"
        data-config="config.js"
        data-path="http://domain.com/"
        data-debug="true"
        data-main="app.js">
</script>
```
## License

BSD license
