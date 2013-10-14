define('plugn/lithe-uml', function(require, exports, module) {

	var maps = [];

	lithe.events.on('compiled', function(mod) {
		var deps = mod.dependencies;
		for (var i = 0; i < deps.length; i++) {
			maps.push('[' + mod.name + ']->[' + deps[i] + ']');
		}
	});
	lithe.events.on('end', function() {
		var origin = 'http://yuml.me/diagram/scruffy;/class/' + maps.join();
        console.log(maps);
        var img = document.createElement('img');
        img.src = origin;
        document.body.appendChild(img);
	});

});

