/**
 * @author xiaojue[designsor@gmail.com]
 * @fileoverview strong file system module
 */
var cpdirSync = require('./hfs/cpdirSync'),
    delSync = require('./hfs/delSync'),
    mkdirSync = require('./hfs/mkdirSync'),
    walk = require('./hfs/walk'),
    writeFileSync = require('./hfs/writeFileSync');

exports.cpdirSync = cpdirSync;
exports.delSync = delSync;
exports.mkdirSync = mkdirSync;
exports.walk = walk;
exports.writeFileSync = writeFileSync;
