var fs = require('fs'),
path = require('path'),
options = require('./options'),
pwd = process.cwd(),
requireRegexp = /require\([\"|\'](.*?)[\"\|\']\)/g,
commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
defineRegexp = /define\([\"|\'](.*?)[\"|\']/g,
hfs = require('../lithe-hfs.js');

function inIgnore(ignore, p) {
	return ! ignore.some(function(item) {
		return !!p.match(new RegExp(item));
	});
}
//转换目录文件define id为basepath 相对路径,转换替换所有匹配alias
//原则上alias不自动生成了，还是以用户自定义为准
function transform(dir, basepath, alias, ignore) {
	ignore = ignore || [];
	alias = alias || [];
	basepath = basepath || options.basepath || pwd;
	hfs.walk(dir, function(files) {
		var allrquires = [];
		files.forEach(function(file) {
			var filename = file;
			file = fs.readFileSync(path.resolve(pwd, file)).toString().replace(commentRegExp, "");
			//替换define id,如果没有define 那么就不需要替换alias
			var isLitheJs = !! file.match(defineRegexp);
			if (isLitheJs) {
                //替换define
                var id = filename.replace(basepath,'').replace(/\.js$/,'');
                file = file.replace(defineRegexp,function($1,$2){
                    return 'define("'+id+'"';
                });
                //替换alias
				file = file.replace(requireRegexp, function($1, $2) {
					for (var i in alias) {
						if ($2 == alias[i]) return 'require("' + i + '")';
					}
					return $1;
				});
                hfs.writeFileSync(filename,file);
                //console.log(filename + ' is transformed,now the define id is ' + id); 
			//}else{
                //console.log(filename + ' is not a lithe module file'); 
            }
		});
	},
	{
		filter: function(el) {
			var ext = path.extname(el);
			if (inIgnore(ignore,el) && ext.indexOf('.json') == - 1 && ext.indexOf('.js') > - 1) return true;
		}
	});
}

module.exports = transform;
