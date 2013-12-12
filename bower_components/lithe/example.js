var fs = require('fs'),
optimist = require('optimist'),
lithe = require('lithe'),
dir = process.cwd(),
tool = lithe.tool,
litheOptions = tool.options,
hfs = lithe.hfs,
path = require('path');

var options = optimist.usage('Build Js for conf', {
	'src': {
		description: 'The base directory to dist.'
	},
	'dist': {
		description: 'The directory dist file to be saved.'
	}
}).argv;

if (!options.src || ! options.dist) {
	optimist.showHelp();
	process.exit();
}

var basepath = path.resolve(dir, options.src),
distpath = path.resolve(dir, options.dist);

litheOptions.basepath = basepath;
litheOptions.uglifyPath = dir + 'node_modules/uglify-js/bin/uglifyjs';

//打包conf的例子代码-自动过滤svn git文件
hfs.walk(basepath + '/conf', function(confs) {
	confs.forEach(function(conf) {
		conf = path.resolve(dir, conf);
		var requires = tool.findJsAllrequires(conf),
		targetfile = distpath + '/conf/' + path.basename(conf);
		requires.push(conf);
		tool.concatFile(requires, targetfile);
		tool.uglifyJs(targetfile, targetfile);
	});
},
{
	filter: function(el) {
		if (path.extname(el).indexOf('.js') > - 1) return true;
	}
});

//调用方法 可直接node example.js --src srcdir --dist distsrc
