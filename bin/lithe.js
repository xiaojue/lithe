var lithe = require('../lithe.js');
var path = require('path');
var fs = require('fs');
var program = require('commander');
var pkg = require('../package.json');
var pwd = process.cwd();

hfs = lithe.hfs;
tool = lithe.tool;
litheOption = tool.options;
litheOption.uglifyPath = path.resolve(__dirname, '../node_modules/uglify-js/bin/uglifyjs');

program.version(pkg.version);
program.option('-c, --config <path>', 'set the config file,it will be return alias and basepath');
program.command('build <source> <target>').description('build source to target').action(build);
program.command('compress <source> <target>').description('compress source to target').action(compress);
program.command('getpackage <source> <target>').description('get source requires to target package').action(getpackage);
program.parse(process.argv);

function beforeProcess(source, target, cb) {
	source = path.resolve(pwd, source);
	target = path.resolve(pwd, target);
	var config = require(path.resolve(pwd, program.config));
	litheOption.basepath = config.basepath;
	litheOption.alias = config.alias;
	if (fs.existsSync(source)) {
		var sourceStat = fs.statSync(source);
		if (sourceStat.isFile()) {
			cb(source, target);
		} else if (sourceStat.isDirectory()) {
			hfs.walk(source, function(files) {
				files.forEach(function(file) {
					var targetfile = path.resolve(target, path.basename(file));
					cb(file, targetfile);
				});
			});
		} else {
			console.error('error: source must be a file or directory!');
		}
	} else {
		console.error('error: source must exists!');
	}
}

function build(source, target) {
	beforeProcess(source, target, function(source, target) {
		var requires = tool.findJsAllrequires(source);
		requires.push(source);
		tool.concatFile(requires, target);
	});
}

function compress(source, target) {
	beforeProcess(source, target, function(source, target) {
		tool.uglifyJs(source, target);
	});
}

function getpackage(source, target) {
	beforeProcess(source, target, function(source, target) {
        tool.getpackage(source,path.basename(target));
	});
}

if (!program.args.length) program.help();

