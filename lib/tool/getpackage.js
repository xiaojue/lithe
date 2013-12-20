var fs = require('fs'),
path = require('path'),
findJsAllrequires = require('./findJsAllrequires.js'),
options = require('./options'),
pwd = process.cwd(),
requireRegexp = /require\([\"|\'](.*?)[\"\|\']\)/g,
commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
defineRegexp = /define\([\"|\'](.*?)[\"|\']/g,
hfs = require('../lithe-hfs.js');

function inIgnore(ignore, p) {
	return ! ignore.some(function(item) {
		return !! p.match(new RegExp(item));
	});
}
//转换目录文件define id为basepath 相对路径,转换替换所有匹配alias
//原则上alias不自动生成了，还是以用户自定义为准
function transform(dir, basepath,ignore) {
	ignore = ignore || [];
	basepath = basepath || options.basepath || pwd;
	hfs.walk(dir, function(files) {
		var allrquires = [];
		files.forEach(function(file) {
			var filename = file;
			file = fs.readFileSync(path.resolve(pwd, file)).toString().replace(commentRegExp, "");
			var isLitheJs = !! file.match(defineRegexp);
			if (isLitheJs) {
				//替换define
				var id = filename.replace(basepath, '').replace(/\.js$/, '');
				file = file.replace(defineRegexp, function($1, $2) {
					return 'define("' + id + '"';
				});
                //转义require
                file = file.replace(requireRegexp,function($1,$2){
                    var newrequire = path.join(dir,$2).replace(basepath,'');
                    return 'require("'+newrequire+'")';     
                });
				hfs.writeFileSync(filename, file);
			}
		});
	},
	{
		filter: function(el) {
			var ext = path.extname(el);
			if (inIgnore(ignore, el) && ext.indexOf('.json') == - 1 && ext.indexOf('.js') > - 1) return true;
		}
	});
}

function getPackage(source, packagename, basepath,alias) {
    var targetpath = path.resolve(pwd,packagename),
        target = path.join(targetpath,packagename + '.js');
    alias = alias || options.alias;
    basepath = basepath || options.basepath;
	var requires = findJsAllrequires(source);
	requires.push(source);
    hfs.mkdirSync(path.resolve(pwd,packagename));
    requires.forEach(function(require,index){
        var file = fs.readFileSync(require).toString(); 
        var id = require.replace(options.basepath,'');
        var filetarget = path.join(targetpath,id);
	    file = file.replace(requireRegexp, function($1, $2) {
	    	if (alias.hasOwnProperty($2)) return 'require("' + alias[$2] + '")';
	    	return $1;
	    });
        if(index == requires.length - 1){
            hfs.writeFileSync(target,file);
        }else{
	        hfs.writeFileSync(filetarget, file);
        }
    });
    transform(targetpath,pwd + '/');
}

module.exports = getPackage;

