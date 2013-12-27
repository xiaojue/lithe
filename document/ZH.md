# Lithe

lithe是一个浏览器端的脚本加载器，它是根据现有标准(NodeJS/CommonJS)来规范定义的。使用起来非常小巧，gzip之后只有2.7k。

如果你使用Gruntjs来构建你的项目，你也可以使用我为grunt开发的 [grunt-lithe][1] 插件。

  [1]: http://www.github.com/xiaojue/grunt-lithe

English Documentation [EN][1]

  [1]: https://github.com/xiaojue/lithe/blob/master/README.md

---

## 安装

```bash
$ npm install lithe -g
$ git clone https://github.com/litheModule/lithe
$ cd lithe
$ npm install -d
```
---

## 命令行工具

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

## 浏览器端API

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
//path/to/app.js 定义一个模块
define('path/to/app',function(require,exports,module){
  var file = require('path/to/file');
  console.log(file.filename); //file.js
  console.log(file.filedir) //path/to
  module.exports = 'i am app.js';
});
```
### lithe.use

```js
//可以用于任何位置
lithe.use('path/to/app',function(app){
    console.log(app); // i am app.js
});
//或者这样使用
lithe.use('a.js','b.js',function(a,b){
  //a和b为exports;
});
```

### config

```js
define('config',function(require,exports,module){
   module.exports = {
      //basepath会替换掉默认根目录为你指定的目录
      basepath:'http://localhost/debug/path', 
      //短命名
      alias:{
        'app':'path/to/app',
        'file':'path/to/file',
        //定义整个目录短名
        'UI':'../'
      }
   };
});

define('someOtherJs',function(){
  var app = require('app'),
  file = require('file');
});
```

## NodeJS端API

```js
//npm install lithe
var lithe = require('lithe'),
tool = lithe.tool,
hfs = lithe.hfs,
options = tool.options;

options.basepath = '你项目本地根目录';
options.uglifyPath = '你得uglify bin 文件地址';
options.alias = {}; //这里要传入你得alias，前后端统一，才可以正确build目录

```

### tool.findJsAllrequires([filepath]) 

```js
var requires = tool.findJsAllrequires('../app.js');
//返回app.js文件所有的依赖，有短命名的一样会返回，不包含app.js
```
### tool.concatFile([files],[target])

```js
tool.concatFile(['/path/to/file1.js','/path/to/file2.js'],'/path/to/file1&file2.js');
//file1和file2会被合并。
```

### tool.uglifyJs([filepath],[target])

```js
tool.uglifyJs('/path/to/file1&file2.js','path/to/file1&file2-min.js');
//相当于执行了 uglifyjs --reserved-names require -o path/to/file1&file2-min.js /path/to/file1&file2.js 命令 压缩文件，设置require为关键字
```

### hfs.cpdirSync([sourceDir],[targetDir])

```js
hfs.cpdirSync('/path/to/dir1','/path/to/dir2');
//同步复制目录，如果多级不存在的目录也会被创建，不会复制.git 和.svn 文件
```

### hfs.delSync([path])

```js
hfs.delSync('/path/to/dir');
hfs.delSync('/path/to/file');
//删除目录或者文件，.git 和.svn 文件会被跳过.
```

### hfs.mkdirSync([target])

```js
hfs.mkdirSync('/path/dir')
//创建目录，如果多级不存在，会一起创建。
```

### hfs.walk([path],[callback],[options])

```js
hfs.walk('/path/',function(files,dirs){
    console.log(files); //'返回所有文件数组';    
},{
    filter:function(file){
    	  //过滤参数
	  if (path.extname(el).indexOf('.js') > - 1) return true;
    }
});
//it's worked sync
```

### hfs.writeFileSync([filepath],[data],[encoding = utf8])

```js
hfs.writeFileSync('/path/file',"abcd");
//写入文件，如果多级目录不存在会一起被创建。
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
## 许可协议

BSD license
