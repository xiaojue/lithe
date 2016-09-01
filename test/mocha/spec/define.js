describe('#define()', function(){

    it('lithe 存在 define 方法，将其暴露到 window 上', function(){
        expect(window.define).to.be.a('function');
        expect(lithe.define).to.be.a('function');
    });

    it('通过 define 传入的构造器函数存在3个参数: require, exports, module', function(){
        define('test_define', function(require, exports, module){
            expect(require).to.be.a('function');
            expect(exports).to.be.a('object');
            expect(module).to.be.a('object');
        });
        lithe.use('test_define');
    });

    it('通过 define 传入的构造器函数可以通过 require 动态引入模块', function(done){
        define('require_test', function(require, exports, module){
            module.exports = 'require_test';
        });

        define('require', function(require, exports, module){
            var str = require('test/mods/string');
            var strReqTest = require('require_test');
            expect(str).to.equal('test/mods/string');
            expect(strReqTest).to.equal('require_test');
            done();
        });
        lithe.use('require');
    });

    it('同名的模块，后定义的模块无效', function(){
        define('same', function(require, exports, module){
            module.exports = 1;
        });

        define('same', function(require, exports, module){
            module.exports = 2;
        });

        lithe.use('same', function(module){
            expect(module).to.equal(1);
        });
    });

    it('模块可以被直接设置为一个空字符串', function(){
        define('string', function(require, exports, module){
            module.exports = '';
        });

        lithe.use('string', function(module){
            expect(module).to.be.a('string');
            expect(module).to.equal('');
        });
    });

    it('模块可以被直接设置为数字 0', function(){
        define('number', function(require, exports, module){
            module.exports = 0;
        });

        lithe.use('number', function(module){
            expect(module).to.be.a('number');
            expect(module).to.equal(0);
        });
    });

    it('模块可以是布尔值', function(){
        define('true', function(require, exports, module){
            module.exports = true;
        });

        define('false', function(require, exports, module){
            module.exports = false;
        });

        lithe.use('true', function(module){
            expect(module).to.equal(true);
        });

        lithe.use('false', function(module){
            expect(module).to.equal(false);
        });
    });

    it('模块可以是一个函数', function(){
        define('func', function(require, exports, module){
            module.exports = function(){};
        });

        lithe.use('func', function(module){
            expect(module).to.be.a('function');
        });
    });

    it('模块可以是一个对象', function(){
        define('object', function(require, exports, module){
            module.exports = {
                name : 'name'
            };
        });

        lithe.use('object', function(module){
            expect(module).to.be.a('object');
            expect(module.name).to.equal('name');
        });
    });


    it('模块可以是一个 null 对象', function(){
        define('null', function(require, exports, module){
            module.exports = null;
        });

        lithe.use('null', function(module){
            expect(module).to.equal(null);
        });
    });

    it('模块可以是一个 undefined 对象', function(){
        define('undef', function(require, exports, module){
            module.exports = undefined;
        });

        lithe.use('undef', function(module){
            expect(module).to.equal(undefined);
        });
    });

    it('可以不设置模块的输出，此时模块为一个空对象', function(){
        define('empty', function(require, exports, module){

        });

        lithe.use('empty', function(module){
            expect(module).to.be.a('object');
            expect(Object.keys(module).length).to.equal(0);
        });
    });

    it('模块可以使用 return 替代 module.exports 来输出', function(){
        define('return', function(require, exports, module){
            return 'return';
        });

        define('return_false', function(require, exports, module){
            return false;
        });

        lithe.use('return', function(module){
            expect(module).to.equal('return');
        });

        lithe.use('return_false', function(module){
            expect(module).to.equal(false);
        });
    });

    it('模块不添加任何返回数据直接 return 时，默认返回一个空对象', function(){
        define('return_empty', function(require, exports, module){
            return;
        });

        lithe.use('return_empty', function(module){
            expect(module).to.be.a('object');
            expect(Object.keys(module).length).to.equal(0);
        });
    });

    it('模块可以使用 exports 对象来输出一个集合', function(){
        define('exports', function(require, exports, module){
            exports.name = 'name';
            exports.value = 'value';
        });

        lithe.use('exports', function(module){
            expect(module).to.be.a('object');
            expect(module.name).to.equal('name');
            expect(module.value).to.equal('value');
        });
    });

});
