define('plugn/lithe-uml', function(require, exports, module) {

	var maps = [];

    function replaceName(name,config){
        if(config && config.alias){
            for(var i in config.alias){
                if(name == config.alias[i]) return i;
            }
        }
        return name;
    }

	lithe.events.on('compiled', function(mod) {
		var deps = mod.dependencies;
		for (var i = 0; i < deps.length; i++) {
			maps.push('[' + replaceName(mod.name,lithe.config) + ']->[' + deps[i] + ']');
		}
	});

	lithe.events.on('end', function() {
		var origin = 'http://yuml.me/diagram/scruffy;/class/' + maps.join();
		console.log(maps.join());
	});

});

