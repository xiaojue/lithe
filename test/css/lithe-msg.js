(function(global, undef) {

	var search = location.search;
	var basepath = getParam(search, 'basepath');
	var originHost = getParam(search, 'origin');
	var version = getParam(search, 'version');

	function getParam(str, key) {
		var data = str.slice(1, str.length).split('&');
		for (var i = 0; i < data.length; i++) {
			var item = data[i].split('=');
			if (key == item[0]) return item[1];
		}
		return null;
	}

	function loadcssText(id, cb) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onload = function() {
			cb(this.responseText);
		};
		xmlhttp.open('GET', basepath + id + '?v=' + version, true);
		xmlhttp.send();
	}

	function onmessage(e) {
		var data = e.data,
		origin = e.origin;
		if (origin == originHost) {
			loadcssText(data, function(ret) {
				var msg = data + '|' + ret;
				window.parent.window.postMessage(msg, originHost);
			});
		}
	}

	window.addEventListener('message', onmessage, false);

})(this);

