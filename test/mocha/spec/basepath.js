describe('basepath', function(){

    it('模块根路径可以在标签的 data-path 属性配置，也可以在配置文件内的 basepath 属性替换。config 模块定义的名称为根路径设定前的名称，调用时使用根路径设定后的名称。', function(done){
        var script = document.getElementById('lithe');
        expect(script.getAttribute('data-config')).to.equal('test/mocha/js/basepath.js');
        
        var basepath = window.location.origin +
            window.location.pathname.replace(/[^\/]+.html/, '') + 'js/"';

        lithe.use('basepath', function(module){
            expect(module).to.be.a('object');
            expect(module.basepath).to.equal(basepath);
            done();
        });
    });

    it('重置模块根路径 basepath 后，模块的名称应当相对于这个根路径制定', function(done){
        lithe.use('mods/string', function(module){
            expect(module).to.be.a('string');
            expect(module).to.equal('mods/string');
            done();
        });
    });

});

