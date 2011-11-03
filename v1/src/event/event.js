/**
 * @author longxiao.fq
 * event.js
 */
(function(host,doc,win){
	
	var Event=function(){
		
		var readyBound=false,
			_readyFnMap=[],
			_Global_CustomEvent={},
			_fixEvent=function(event){
			 	event.preventDefault = fixEvent.preventDefault;
			    event.stopPropagation = fixEvent.stopPropagation;
			    return event;
			},
			_handleEvent=function(event) {
			    var returnValue = true , i=0;
			    event = event || _fixEvent(window.event);
			    var handlers = this._eventMaps[event.type] , length = handlers.length;
			    for ( ; i < length ; i++) {
			        if ( handlers[i].call( this , event) === false ){
			            returnValue = false;
			        }
			    }
			    return returnValue;
			};
			
			_fixEvent.preventDefault = function() {
			    this.returnValue = false;
			};
			_fixEvent.stopPropagation = function() {
			    this.cancelBubble = true;
			};
		
		var _fn={
			/*customEvent*/	
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
			/*dom ready*/
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
				_fn.bind( window, "load", _fn.ready );
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
			},
			/*bind and remove event*/
			bind: function(element , type , fun){
                if(!element._eventMaps) element._eventMaps={};
                
                var handlers=element._eventMaps[type];
                
                if(!handlers){
                	 handlers = element._eventMaps[type] = [];
                	 if(element['on' + type]) {        
                         handlers[0] = element['on' + type];
                     }
                }
                
                if( handlers.indexOf(fun) >= 0) handlers[handlers.length] = fun;
                
                element['on' + type] = _handleEvent;
            },
			unbind:function(element , type , fun){
            	if (element._eventMaps && element._eventMaps[type]) {
            		 var index = element._eventMaps[type].indexOf(fun);
            		 if ( !index ) return;
            		 return element._eventMaps[type].splice(index,1);
                }
			}
		};
		
		return {
			customEvent:_fn.customEvent,
			ready:_fn.DOMready,
			add:_fn.bind,
			removeEvent:_fn.unbind
		};
		
	}();
	
	host.Event=Event;
	
})(lithe,document,window);