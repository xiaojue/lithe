/**
 * @author xiaojue[designsor@gmail.com]
 * @fileoverview lithe module build help
 */

var concatFile = require('./tool/concatFile'),
convertcss = require('./tool/convertcss'),
findJsAllrequires = require('./tool/findJsAllrequires'),
uglifyJs = require('./tool/uglifyJs'),
getpackage = require('./tool/getpackage'),
options = require('./tool/options'),
uniq = require('./tool/uniq');

exports.concatFile = concatFile;
exports.findJsAllrequires = findJsAllrequires;
exports.uglifyJs = uglifyJs;
exports.options = options;
exports.getpackage = getpackage;
exports.convertcss = convertcss;
// 改动
exports.uniq = uniq;

