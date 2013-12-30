var fs = require('fs'),
path = require('path'),
hfs = require('../lithe-hfs.js'),
pwd = process.cwd(),
options = require('./options');

//把css文件转换成module - js file,解决跨域问题 
/* 
    This function is loosely based on the one found here:
    http://www.weanswer.it/blog/optimize-css-javascript-remove-comments-php/
*/
function removeComments(str) {
	str = ('__' + str + '__').split('');
	var mode = {
		singleQuote: false,
		doubleQuote: false,
		regex: false,
		blockComment: false,
		lineComment: false,
		condComp: false
	};
	for (var i = 0, l = str.length; i < l; i++) {

		if (mode.regex) {
			if (str[i] === '/' && str[i - 1] !== '\\') {
				mode.regex = false;
			}
			continue;
		}

		if (mode.singleQuote) {
			if (str[i] === "'" && str[i - 1] !== '\\') {
				mode.singleQuote = false;
			}
			continue;
		}

		if (mode.doubleQuote) {
			if (str[i] === '"' && str[i - 1] !== '\\') {
				mode.doubleQuote = false;
			}
			continue;
		}

		if (mode.blockComment) {
			if (str[i] === '*' && str[i + 1] === '/') {
				str[i + 1] = '';
				mode.blockComment = false;
			}
			str[i] = '';
			continue;
		}

		if (mode.lineComment) {
			if (str[i + 1] === '\n' || str[i + 1] === '\r') {
				mode.lineComment = false;
			}
			str[i] = '';
			continue;
		}

		if (mode.condComp) {
			if (str[i - 2] === '@' && str[i - 1] === '*' && str[i] === '/') {
				mode.condComp = false;
			}
			continue;
		}

		mode.doubleQuote = str[i] === '"';
		mode.singleQuote = str[i] === "'";

		if (str[i] === '/') {

			if (str[i + 1] === '*' && str[i + 2] === '@') {
				mode.condComp = true;
				continue;
			}
			if (str[i + 1] === '*') {
				str[i] = '';
				mode.blockComment = true;
				continue;
			}
			if (str[i + 1] === '/') {
				str[i] = '';
				mode.lineComment = true;
				continue;
			}
			mode.regex = true;

		}

	}
	return str.join('').slice(2, - 2);
}

function convertcss(source, target) {
	var targetpath = path.resolve(pwd, target);
	var css = fs.readFileSync(source).toString();
	css = removeComments(css);
    css = css.replace(/\"/g,"'");
	var template = 'define("'+target+'",function(){' + 'module.exports = "'+css+'";});';
    hfs.writeFileSync(target,template);
}

module.exports = convertcss;
