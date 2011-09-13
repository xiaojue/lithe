/**
 * @author xiaojue
 * @date 20110715
 * ua.js
 */
(function(host,win,doc){
	
	var UA=function(){
		var UA=win.navigator.userAgent,
			o={
				// browser core type
				//webkit: 0,
	            //trident: 0,
	            //gecko: 0,
	            //presto: 0,

	            // browser type
	            //chrome: 0,
	            //safari: 0,
	            //firefox: 0,
	            //ie: 0,
	            //opera: 0
			},
			reg={
				webkit:/AppleWebKit\/([\d.]*)/,
				presto:/Presto\/([\d.]*)/,
				trident:/MSIE\s([^;]*)/,
				gecko:/Gecko/,
				
				chrome:/Chrome\/([\d.]*)/,
				safari:/\/([\d.]*) Safari/,
				opera:/Opera\/([\d.]*)/,
				firefox:/Firefox\/([\d.]*)/,
				ie:/Trident\/([\d.]*)/
			};
		
		
		function matchnumber(s){
			
		}
		
		
		
		return o;
	}();
	
	host.UA=UA;
	
})(lithe,window,document);