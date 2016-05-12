define('conf/app', function(require, exports, module) {
	var markdown = require('markdown');
	var readme = require('common/readme');

	// 改动,引入zepto和knowme
	 var $ = require("vendors/zepto.js");

	 var ll = require("vendors/lazyload.js");
	 // document.getElementById('readme').innerHTML = markdown.toHTML(readme);

	 console.log("ll...", ll);

	 $('#readme').html(markdown.toHTML(readme));
});

