describe('Config', function(){
  
  it('可以通过标签属性 data-config 来指定配置文件路径', function(done){
    var script = document.getElementById('lithe');
    expect(script.getAttribute('data-config')).to.equal('config.js');
    lithe.use('config', function(module){
      expect(module).to.be.a('object');
      done();
    });
  });

  it('作为配置项的 config 模块引入时，不应当包含除了模块定义之外的其他属性', function(done){
    lithe.use('config', function(module){
      var keys = Object.keys(module);
      console.log(module);
      expect(keys.length).to.equal(1);
      expect(keys[0]).to.equal('alias');
      done();
    });
  });

  it('可以通过标签属性 data-path 设置一个绝对路径地址，来指定模块根路径', function(done){
    var script = document.getElementById('lithe');
    var basePath = window.location.origin +
      window.location.pathname.replace(/[^\/]+.html/, '') + 'js/';
    expect(script.getAttribute('data-path')).to.equal(basePath);
    lithe.use('mods/string', function(module){
      expect(module).to.equal('mods/string');
      done();
    });
  });

  it('可以通过标签属性 data-debug="true" 启用调试模式，页面加载的 script 不会被移除', function(done){
    var basePath = window.location.origin +
      window.location.pathname.replace(/[^\/]+.html/, '') + 'js/';
    var modulePath = basePath + 'mods/number.js';

    expect(document.getElementById('lithe').getAttribute('data-debug')).to.equal('true');
    lithe.use('mods/number', function(module){
      var script = document.querySelector('[src="' + modulePath + '"]');
      expect(script).to.be.a('object');
      expect(module).to.equal(0);
      done();
    });
  });

  it('可以在 config 中配置 alias 对象指定模块别名', function(done){
    lithe.use('mods/alias', function(module){
      expect(module).to.equal('mods/alias');
      done();
    });
  });

  it('可以通过标签属性 data-main 调用入口模块', function(done){
    var script = document.getElementById('lithe');
    expect(script.getAttribute('data-main')).to.equal('mods/main');
    this.timeout(500);
    setTimeout(function(){
      expect(window.main).to.equal('mods/main');
      done();
    }, 100);
  });

});


