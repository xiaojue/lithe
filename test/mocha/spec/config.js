describe('配置', function(){

    it('存在 config 对象', function(done){
        lithe.use('config', function(module){
            expect(module).to.be.a('object');
            done();
        });
    });

    // it('可以通过配置 config.base 来指定模块根路径', function(done){
    //     lithe.use('mods/string', function(module){
    //         console.log(module);
    //         expect(module).to.equal('string');
    //         done();
    //     });
    // });


});

