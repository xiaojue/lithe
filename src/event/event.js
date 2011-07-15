/**
 * @author longxiao.fq
 * event.js
 */
(function(host,doc,win){
	
	var Event=function(){
		
		var readyBound=false,
			_readyFnMap=[],
			_Global_CustomEvent={};
		
		var _fn={
				
			customEvent:{
				fire:function(name,args){
					var map=_Global_CustomEvent;
					if(map.hasOwnProperty(name)) map[name](args);	
				},
				bind:function(name,fun,cover){
					var map=_Global_CustomEvent;
					if(!map.hasOwnProperty(name) || cover){
						map[name]=fun;
					}
				}
			},
			
			_bindReady:function(){
				if ( readyBound ) return;
				readyBound = true;
				// Mozilla, Opera and webkit nightlies currently support
				// this event
				if ( document.addEventListener ) {
				// Use the handy event callback
					document.addEventListener( "DOMContentLoaded", function(){
					document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
					_fn.ready();
				}, false );
				// If IE event model is used
				} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
					document.attachEvent("onreadystatechange", function(){
						if ( document.readyState === "complete" ) {
							document.detachEvent( "onreadystatechange", arguments.callee );
							_fn.ready();
						}
					});
				// If IE and not an iframe
				// continually check to see if the document is ready
					if ( document.documentElement.doScroll && typeof window.frameElement === "undefined" ) (function(){
					if ( _fn._isDOMready ) return;
						try {
						// If IE is used, use the trick by Diego Perini
						// http://javascript.nwbox.com/IEContentLoaded/
							document.documentElement.doScroll("left");
						} catch( error ) {
							setTimeout( arguments.callee, 0 );
							return;
						}
							// and execute any waiting functions
							_fn.ready();
					})();
				}
				
				// A fallback to window.onload, that will always work
				//host.event.add( window, "load", jQuery.ready );
			},
			
			ready:function(){
				_fn._isDOMready=true;
				if(_fn._isDOMready){
					host.each(_readyFnMap,function(index,fn){
						fn();
					});
				}
			},
			
			_isDOMready:false,
			
			DOMready:function(fn){
				_readyFnMap.push(fn);
				if(!_fn._isDOMready) {
					_fn._bindReady();
				}else{
					_fn.ready();
				}
			}
		};
		
		return {
			customEvent:_fn.customEvent,
			ready:_fn.DOMready
		};
		
	}();
	
	host.Event=Event;
	
})(lithe,document,window);