describe('#loadjs()', function() {

  this.timeout(10000);

  it('lithe 存在 data-path 为绝对路径,也可以设置根目录地址', function(done) {
    lithe.use('test/mods/remote', function(module) {
      expect(module).to.equal('test/mods/remote');
      done();
    });
  });

  it('可以使用 loadjs 方法加载远程模块', function(done){
    lithe.load('http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js', function(){
      expect(window.jQuery).to.be.a('function');
      done();
    });
  });

  it('可以使用 loadjs 方法加载多个远程模块', function(done) {
    lithe.load(['http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js', 'http://cdn.rawgit.com/jashkenas/underscore/master/underscore-min.js', 'http://cdn.rawgit.com/jashkenas/backbone/master/backbone-min.js'], function() {
      expect(window.Backbone).to.be.a('object');
      done();
    });
  });

});

