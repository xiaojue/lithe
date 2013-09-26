define('spec/spec',function(require,exports,module){
    var a = require('mods/a');
    var b = require('mods/b');
    var c = require('mods/c');
    var d = require('mods/d.js?a=1');
    var e = require('mods/e');
    var f = require('mods/f');
    var g = require('g');
    var h = require('h');
    var i = require('i');
    console.log('spec/spec');

    require('dir/dir');

    describe("lithe suite",function(){
        it('test all modules ready and exports is right',function(){
            expect(a.a).toBe(1); 
            expect(b).toBe(false); 
            expect(c).toBe(true); 
            expect(d.d.g).toBe('g'); 
            expect(e.e()).toBe('e'); 
            expect(f.f).toBe('i'); 
            expect(g.g).toBe('g'); 
            expect(i).toBe('i'); 
        });
    });
});
