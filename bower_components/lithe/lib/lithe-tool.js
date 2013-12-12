/**
 * @author xiaojue[designsor@gmail.com]
 * @fileoverview lithe module build help
 */

var concatFile = require('./tool/concatFile'),
    findJsAllrequires = require('./tool/findJsAllrequires'),
    uglifyJs = require('./tool/uglifyJs'),
    options = require('./tool/options');

exports.concatFile = concatFile;
exports.findJsAllrequires = findJsAllrequires;
exports.uglifyJs = uglifyJs;
exports.options = options;
