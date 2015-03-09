define('test/mocha/js/basepath', function(require,exports,module){

	var basepath = window.location.origin +
		window.location.pathname.replace(/[^\/]+.html/, '') + 'js/"';

	module.exports = {
		basepath : basepath
	};
});
