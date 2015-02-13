describe('#use()', function(){

	it('lithe 存在 use 方法，这个方法不暴露到window', function(){
		expect(lithe.use).to.be.a('function');
		expect(window.use).to.equal(undefined);
	});

	it('use 方法可动态引入模块，未定义标签的 data-path 属性，和 config.basepath 时，模块根路径为 lithe.js 所在的目录', function(done){
		lithe.use('test/mods/string', function(module){
			expect(module).to.equal('test/mods/string');
			done();
		});
	});

	it('模块的依赖以递归的方式被引入', function(done){
		lithe.use('test/mods/func', function(module){
			expect(module()).to.equal('0test/mods/string');
			done();
		});
	});

	it('可用相对路径方式引入文件', function(done){
		lithe.use('test/mods/string.js', function(module){
			expect(module).to.equal('test/mods/string');
			done();
		});
	});

	it('路径参数没有影响', function(done){
		lithe.use('test/mods/query.js?key=value#key', function(module){
			expect(module).to.equal('test/mods/query');
			done();
		});
	});

	it('现在路径不能识别 hash，会返回 null', function(done){
		var obj = {};
		var check = function(val){
			obj[val] = true;
			if(obj.hash && obj.nohash){
				done();
			}
		};
		lithe.use('test/mods/hash.js#key', function(module){
			expect(module).to.equal(null);
			check('hash');
		});
		lithe.use('test/mods/hash', function(module){
			expect(module).to.equal('test/mods/hash');
			check('nohash');
		});
	});

	it('现在不能引入绝对路径的远程文件，会返回 null', function(done){
		this.timeout(10000);
		lithe.use('http://cdn.rawgit.com/litheModule/lithe/master/test/mods/remote.js', function(module){
			expect(module).to.equal(null);
			done();
		});
	});

});

