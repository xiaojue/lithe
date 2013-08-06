define('config',function(require,exports,module){
    module.exports = {
        timestamp:new Date().valueOf(),
        alias:{
            'mods':'mods/',
            'g':'mods/a/g.js',
            'h':'mods/b/h.js',
            'i':'mods/c/i.js'
        }
    };
});
