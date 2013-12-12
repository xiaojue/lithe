function uniq(ar) {
	var m, n = [],
	o = {};
	for (var i = 0;
	(m = ar[i]) !== undefined; i++) {
		if (!o[m]) {
			n.push(m);
			o[m] = true;
		}
	}
	return n;
}

module.exports = uniq;
