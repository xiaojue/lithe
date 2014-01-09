define("mods/a",function(require,exports,module){
    var d = require('mods/d');
    exports.a = 1;
});

define("mods/b",function(require,exports,module){
    var e = require('mods/e');
    module.exports = false;
});

define("mods/c",function(require,exports,module){
    var f = require('mods/f');
    return true;
});

define("mods/d",function(require,exports,module){
    var g = require('g');
    exports.d = g;
});

define("mods/e",function(require,exports,module){
    exports.e = function(){
        return 'e';
    };
});

define("mods/f",function(require,exports,module){
    var i = require('i');
    exports.f = i;
});

define("mods/a/g", function(require, exports, module) {
	var test1 = require('test.css');
	var test2 = require('test2.css');
	var test3 = require('test/test3.css');
    console.log(test1,test2,test3);
	exports.g = 'g';
});


define("mods/b/h",function(require,exports,module){
    module.exports = function(){
        return 'h';
    };
});

define("mods/c/i",function(require,exports,module){
    module.exports = 'i';
});

define("mods/dir/dir",function(require,exports,module){
    console.log('mods/dir/dir.js');
});

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

