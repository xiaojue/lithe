/**
 * @author xiaojue[designsor@gmail.com]
 * @fileoverview lithe module build help
 */
var fs = require('fs'),
    exec = require('child_process').exec,
    path = require('path'),
    dir = process.cwd(),
    jsmap = {},
    jsstartdir = '',
    uglifyjs = dir + '/node_modules/uglify-js/bin/uglifyjs';

var tool = {
	_uniq: function(ar) {
		var m, n = [],
		o = {};
		for (var i = 0;
		(m = ar[i]) !== undefined; i++) {
			if (!o[m]) {
				n.push(m);
				o[m] = true;
			}
		}
		return n;
	},
	concatFile: function(files, target) {
		var ret = '';
		var self = this;
		files.forEach(function(el) {
			if (fs.existsSync(el)) {
				ret += fs.readFileSync(el);
			}
		});
		fs.writeFileSync(target, ret);
	},
    _hasJsrequires:function(jsfile){
		var requires = tool._getJsrequires(jsfile);
		if (requires.length) return true;
		else return false;
    },
	_getJsrequires: function(jsfile) {
		var ret = [];
		if (fs.existsSync(jsfile)) {
			var file = fs.readFileSync(jsfile),
		    commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
			regexp = /require\([\"|\'](.*?)[\"\|\']\)/g;
			file = file.toString().replace(commentRegExp, '');
			while ((result = regexp.exec(file)) !== null) {
				ret.push(RegExp.$1);
			}
		}
		return ret;
	},
	findJsAllrequires: function(jsfile,alias,ret) {
        if(!ret) ret = [];
        if(!alias) alias = {};
        if(!jsstartdir) jsstartdir = jsfile;
		var requires = tool._getJsrequires(jsfile);
        requires.forEach(function(require){
            if(alias.hasOwnProperty(require)) require = alias[require];
            var file = path.resolve(path.dirname(jsstartdir),require);
            if(path.extname(file) === '' || path.extname(file) !== '.js') file = file + '.js';
            if(tool._hasJsrequires(file)){
                jsmap[file] = true;
            }
            ret.push(file);
        });
		var over = tool._isJsMapClear(jsmap);
		if (over !== true) {
			tool.findJsAllrequires(over,alias,ret);
		}
		ret = tool._uniq(ret);
        jsmap = [];
		return ret;
	},
	_isJsMapClear: function(jsmap) {
		for (var i in jsmap) {
			if (jsmap[i]) {
				delete jsmap[i];
				return i;
			}
		}
		return true;
	},
    uglifyJs:function(jsfile,target,cb){
        console.log('uglifyjs is compressing for:'+jsfile);
        exec(uglifyjs + ' --reserved-names require -o '+target+' '+jsfile,function(){
			if (typeof cb == 'function') cb();
            console.log(target+' is compressed!');
        });
    }
};

exports.tool = tool;
