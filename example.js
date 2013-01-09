var litheTool = require('./lithe.js').tool;
var path = require('path');
var dir = process.cwd();
var cdpath = function(val){
    return path.resolve(dir,val);
};
var alias = {
	'$': 'lithe-modules/jquery-1.8.2.min',
	'util': 'lithe-modules/util',
	'class': 'lithe-modules/class',
	'events': 'lithe-modules/events',
	'backbone': 'lithe-modules/backbone',
	'es5-safe': 'lithe-modules/es5-safe',
	'underscore': 'lithe-modules/underscore',
	'mousewheel': 'lithe-modules/jquery.mousewheel',
	'drag': 'lithe-modules/jquery.event.drag-2.2',
	'touchy': 'lithe-modules/jquery.touchy.min'
};
//查找依赖
var ret = litheTool.findJsAllrequires('../app.js',alias);
console.log(ret);
/*
[ '/home/fuqiang/dev/haml/5/lithe-modules/jquery-1.8.2.min.js',
'/home/fuqiang/dev/haml/5/lithe-modules/util.js',
'/home/fuqiang/dev/haml/5/routes.js',
'/home/fuqiang/dev/haml/5/lithe-modules/underscore.js',
'/home/fuqiang/dev/haml/5/lithe-modules/backbone.js' ]
*/
//合并
litheTool.concatFile(ret,cdpath('./app-all.js'));
//压缩
litheTool.uglifyJs(cdpath('./app-all.js'),cdpath('./app-all-min.js'));
