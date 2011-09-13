/**
 * @author longxiao.fq
 * core.js
 */
(function(win) {
	
	var lithe=function(){
		
		var _fn={
				each:function(o,callback){
					for(var i in o){
						if(callback){
							if( callback( i , o[i] ) == false) break;
						} 
					}
				},
				mix:function(o,s,cover,deep){
					var fn = this;
					fn.each(s,function(i,v){
						if(!deep){
							if(!o.hasOwnProperty(i) || cover) o[i]=v;
						}else{
							if(!o.hasOwnProperty(i) || cover){
								if((typeof(v)=="object") && (v instanceof Object)){
									fn.mix(o,v,cover,deep);
								}else{
									o[i]=v;
								}
							}
						}
					});
					return o;				
				},
				extend:function(r, s, px, sx){
					var fn=this;
					
		            if (!s || !r) return r;
		
		            var create = Object.create ?
		                function(proto, c) {
		                    return Object.create(proto, {
		                        constructor: {
		                            value: c
		                        }
		                    });
		                } :
		                function (proto, c) {
		                    function F() {
		                    }
		
		                    F.prototype = proto;
		
		                    var o = new F();
		                    o.constructor = c;
		                    return o;
		                },
		                sp = s.prototype,
		                rp;
		
		            rp = create(sp, r);
		            r.prototype = fn.mix(rp, r.prototype);
		            r.superclass = create(sp, s);
		
		            if (px) fn.mix(rp, px);
		
		            if (sx) fn.mix(r, sx);
		
		            return r;
				}
		};
		
		return {
			each:_fn.each,
			mix:_fn.mix,
			extend:_fn.extend
		};
		
	}();
	
	win.lithe=lithe;
	
})(this);/**
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
		
		/**
		 * 根据ua匹配相应内核的浏览器版本号
		 */
		function matchnumber(s){
							
		}
		
		
		
		return o;
	}();
	
	host.UA=UA;
	
})(lithe,window,document);
/**
 * @author longxiao.fq
 * dom.js
 */
(function(host,doc){
	
	var DOM=function(){
		
		var _fn={
				_findChild:function(parent,text){
					var that=_fn,
						indexid=text.indexOf('#'),
						id=text.slice(indexid+1),
						indexcls=text.indexOf('.'),
						cls=text.slice(indexcls+1),
						tag=text.slice(0,indexcls);
					if(indexid!=-1){
						return [doc.getElementById(id)];	
					}else if(indexcls!=-1 && indexcls!=0){
						return that._getElementsByClassName(cls,parent,tag);	
					}else if(indexcls!=-1 && indexcls==0){
						return that._getElementsByClassName(text.slice(1),parent);	
					}else{
						return Array.prototype.slice.call(parent.getElementsByTagName(text),0);	
					}
				},
				_getElementsByClassName:function(cls,parent,tag){
					var results=[];
					if(parent==null) parent=doc;
					if(!tag) tag='*';
					
					function likecls(s,o){
						var ary=o.split(' ');
						for(var i=0;i<ary.length;i++){
							if(s==ary[i]) return true;
						}
						return false;
					}
					var eles=parent.getElementsByTagName(tag);
					for(var i=0;i<eles.length;i++){
						if(eles[i].className==cls || likecls(cls,eles[i].className)){
							results.push(eles[i]);
						} 
					}
					return results;
				},
				_selector:function(selectors){
					var fn=_fn,
						that=_fn,
						selectors=selectors,
						realselector='',
						order=[], 
						result,
						results;	
								
					if(typeof(selectors)!='string') return null;
					
					order=selectors.split(' ');
					
					for(var i=order.length-1;i>=0;i--){
						var selector=order[i].slice(0,1);
						if(selector=='#'){
							realselector+=' '+order[i];
							break;						
						}else{
							if(order[i].match(/#/)){
								realselector+=' '+order[i];
								break;	
							}else{
								realselector+=' '+order[i];
							}
						}
					}
					order=realselector.slice(1).split(' ').reverse();
					
					if(order.length==1){
						return that._findChild(doc,order[0]);
					}else{
						for(var i=0;i<order.length;i++){
							if(i==order.length-1) return results;
							
							result=that._findChild(doc,order[i]);
							
							results=[];
							
							for(var j=0;j<result.length;j++){
								results=results.concat(that._findChild(result[j],order[i+1]));
							}
						}
						return results;
					}	
				},
				query:function(selector){
					var that=_fn;
					if(doc.querySelectorAll) return doc.querySelectorAll(selector);	
					return that._selector(selector);
				},
				get:function(selector){
					var that=_fn;
					if(doc.querySelector) return doc.querySelector(selector);	
					var	result=that._selector(selector);
					if((typeof(result)=="object") && (result instanceof Array)) return result[0];
					return result;				
				}
		};
		
		return {
			query:_fn.query,
			get:_fn.get
		};
		
	}();
	
	host.DOM=DOM;
	
})(lithe,document);/**
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