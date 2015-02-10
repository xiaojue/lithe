define('string', function(require, exports, module){
    module.exports = '';
});

define('number', function(require, exports, module){
    module.exports = 0;
});

define('func', function(require, exports, module){
    module.exports = function(){};
});

define('object', function(require, exports, module){
    module.exports = {};
});

define('null', function(require, exports, module){
    module.exports = null;
});

define('undef', function(require, exports, module){
	module.exports = undefined;
});

define('empty', function(require, exports, module){

});

define('return', function(require, exports, module){
	return 'return';
});

define('exports', function(require, exports, module){
	exports.name = 'name';
	exports.value = 'value';
});

describe('#define()', function(){

	define('test', function(require, exports, module){
		var str = require('string');
		var number = require('number');
		var func = require('func');
		var obj = require('object');
		var nil = require('null');
		var undef = require('undef');
		var empty = require('empty');
		var ret = require('return');
		var exp = require('exports');

		it('模块可以被直接设置为一个空字符串', function(){
			expect(str).to.be.a('string');
			expect(str).to.equal('');
		});

		it('模块可以被直接设置为数字0', function(){
			expect(number).to.be.a('number');
			expect(number).to.equal(0);
		});

		it('模块可以是一个函数', function(){
			expect(func).to.be.a('function');
		});

		it('模块可以是一个对象', function(){
			expect(obj).to.be.a('object');
		});

		it('模块可以是一个 null 对象', function(){
			expect(nil).to.equal(null);
		});

		it('模块可以是一个 undefined 对象', function(){
			expect(undef).to.equal(undefined);
		});

		it('可以不设置模块的输出，此时模块为一个空对象', function(){
			expect(empty).to.be.a('object');
			expect(Object.keys(empty).length).to.equal(0);
		});

		it('模块可以使用 return 替代 module.exports 来输出', function(){
			expect(ret).to.equal('return');
		});
		
		it('模块可以使用 exports 对象来输出一个集合', function(){
			expect(exp).to.be.a('object');
			expect(exp.name).to.equal('name');
			expect(exp.value).to.equal('value');
		});
	});

	lithe.use('test');

});
