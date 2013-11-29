define('conf/app', function(require, exports, module) {
	var markdown = require('markdown');
	var readme = require('common/readme');
	document.getElementById('readme').innerHTML = markdown.toHTML(readme);
});

