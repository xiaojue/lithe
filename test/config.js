define('config',function(require,exports,module){
    module.exports = {
        timestamp:new Date().valueOf(),
        alias:{
            'dir':'mods/dir/',
            'g':'mods/a/g.js',
            'h':'mods/b/h.js',
            'i':'mods/c/i.js'
        }
    };
});
