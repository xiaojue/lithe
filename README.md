# Lithe

一个前端javascript模块加载器，保持cmd实现和amd方法的调用，尽量做到精简小巧，方便上手和部署于各种项目。

---

## public api

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
  //a and b is required;
});
```

### config

```js
define('config',function(require,exports,module){
   module.exports = {
      alias:{
        'app':'path/to/app',
        'file':'path/to/file'
      } 
   };
});

define('someOtherJs',function(){
  var app = require('app'),
  file = require('file');
  //now the path/to/app and path/to/file is required
});
```

### 如何部署？

```html
<script src="/lithe.js" data-config="/config.js" data-path="http://domain.com/" data-main="app.js"></script>
```

嗯，就是这么简单！
