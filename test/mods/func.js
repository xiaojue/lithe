define('test/mods/func',function(require,exports,module){
	var str = require('test/mods/string');
	var num = require('test/mods/number');
	module.exports = function(){
		return num + str;
	};
});
