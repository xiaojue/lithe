define('plugn/lithe-cache', function(require, exports, module) {

	if (localStorage) {

		var bridgeReady;

		var litheCache = function(version, bridgeUrl, bridgeDomain, cssBasePath, key) {
			this.version = version;
			this.cssBasePath = cssBasePath;
			this.bridgeUrl = bridgeUrl;
			this.bridgeDomain = bridgeDomain;
			this.key = key || 'litheCache';
			this.cache = JSON.parse(localStorage.getItem(this.key)) || {};
			this.msgqueue = {};
			this.init();
			return this;
		};

		litheCache.prototype = {
			constructor: litheCache,
			init: function() {
				var cache = this.cache,
				currentVersion = cache._version,
				version = this.version;
				if (!currentVersion || currentVersion != version) {
					cache = {};
					cache._version = version;
				}
				this.initCssBridge();
				this.bindEvent();
			},
			bindEvent: function() {

				var self = this,
				msgqueue = this.msgqueue,
				cache = this.cache;

				lithe.events.on('fetch', function(url, cb) {
					if (self.isCss(url)) self.fetchCss(url, cb);
				});

				lithe.events.on('fetchsuccess', function(mod, style) {
					//it's css module
					if (mod.status === 0 && style) {
						mod.status = 4; //css is compiled
						mod.exports = style;
					}
				});

				lithe.events.on('start', function(urls) {
					urls.forEach(function(url) {
						if (cache[url]) {
							if (self.isCss(url)) {
								lithe.events.trigger('fetchsuccess', [lithe.get(url), cache[url]]);
							} else {
								console.log(cache[url]);
								eval('define(url,' + cache[url] + ')');
							}
						}
					});
				});

				lithe.events.on('compiled', function(mod) {
					cache[mod.id] = mod.factory.toString();
				});

				lithe.events.on('end', function() {
					localStorage.setItem('litheCache', JSON.stringify(cache));
				});

				window.addEventListener('message', function(e) {
					var data = e.data.split('|'),
					origin = e.origin;
					if (origin == self.bridgeDomain) {
						var url = data[0],
						style = data[1];
						if (msgqueue[url]) {
							cache[url] = style;
							msgqueue[url].forEach(function(cb) {
								cb(style);
							});
							delete msgqueue[url];
						}
					}
				},
				false);

			},
			initCssBridge: function() {
				var doc = document,
				head = doc.getElementsByTagName('head')[0],
				bridge = doc.createElement('iframe');
				bridge.style.cssText = 'height:1px;width:1px;position:absolute;left:-999px;top:-999px;';
				bridge.id = 'css_bridge';
				bridge.onload = function() {
					bridgeReady = true;
				};
				bridge.src = this.bridgeUrl + '?basepath=' + this.cssBasePath + '&origin=' + location.origin + '&version=' + this.version;
				doc.body.appendChild(bridge);
			},
			fetchCss: function(url, cb) {
				var self = this;
				if (bridgeReady) {
					if (!this.msgqueue[url]) this.msgqueue[url] = [];
					this.msgqueue[url].push(cb);
					window.frames['css_bridge'].postMessage(url, this.bridgeDomain);
				} else {
					setTimeout(function() {
						self.fetchCss(url, cb);
					},
					1);
				}
			},
			isCss: function(url) {
				return (/\.css$/).test(url);
			},
			clear: function() {
				localStorage.removeItem(this.key);
			}
		};

		var bridgeDomain = 'http://www.test.com';
		var bridgeUrl = 'http://www.test.com/lithe/test/css/post.html';
		var cssBasePath = 'http://www.test.com/lithe/test/css/';
		var version = '0.0.1';

		var cache = new litheCache(version, bridgeUrl, bridgeDomain, cssBasePath);

		lithe.clearCache = function() {
			cache.clear();
		};

	}

});

