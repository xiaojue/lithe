describe('Config', function(){

	it('标签属性 data-path 可以设置一个相对于 lithe.js 的相对路径地址', function(done){
		var script = document.getElementById('lithe');
		expect(script.getAttribute('data-config')).to.equal('config.js');
		lithe.use('config', function(module){
			expect(module).to.be.a('object');
			done();
		});
	});

	it('可以通过标签属性 data-path 设置一个相对于 lithe.js 的相对路径地址("./"开头)，来指定模块根路径', function(done){
		var script = document.getElementById('lithe');
		var basePath = './test/mocha/js/';
		expect(script.getAttribute('data-path')).to.equal(basePath);
		lithe.use('mods/string', function(module){
			expect(module).to.equal('mods/string');
			done();
		});
	});

});

