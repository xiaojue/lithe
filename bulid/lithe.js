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
 * @author longxiao.fq
 * dom.js
 * �����Ż�
 */
(function(host,doc){
	
	var DOM=function(){
		
		var _fn={
				/**
				 * ֧������
				 * #id
				 * .class
				 * tag
				 */
				_findChild:function(parent,text){
					var that=myCore.DOM,
						indexid=text.indexOf('#'),
						id=text.slice(indexid+1),
						indexcls=text.indexOf('.'),
						cls=text.slice(indexcls+1),
						tag=text.slice(0,indexcls);
					//���?��ѡ���Ķ������
					if(indexid!=-1){
						//�����#ֱ�ӷ���
						return [doc.getElementById(id)];	
					}else if(indexcls!=-1 && indexcls!=0){
						//��cls���Һ���tag
						return that._getElementsByClassName(cls,parent,tag);	
					}else if(indexcls!=-1 && indexcls==0){
						//����cls�����ҽ���cls
						return that._getElementsByClassName(text.slice(1),parent);	
					}else{
						//ֻ����tag
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
					var fn=myCore.fn,
						that=myCore.DOM,
						selectors=selectors,
						realselector='',
						order=[], //ѡ��������	
						result,
						results;	
								
					if(typeof(selectors)!='string') return null;
					
					//���Ȱ��տո����
					order=selectors.split(' ');
					
					//���ҵ�һ��id��ȷ�����е���߼�
					//���û��id����tag��
					//���û��tag����class
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
					//ȷ����������,�ų��ID���
					order=realselector.slice(1).split(' ').reverse();
					
					if(order.length==1){
						//û�ո񣬵�ѡ���ֱ�ӷ���ֵ
						return that._findChild(doc,order[0]);
					}else{
						//����ո�ĵ��Ѱ��
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
					var that=myCore.DOM;
					if(doc.querySelectorAll) return doc.querySelectorAll(selector);	
					return that._selector(selector);
				},
				get:function(selector){
					var that=myCore.DOM;
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
		
		var readyBound=false;
		
		var _fn={
				
			customEvent:{
				fire:function(name,args){
					var map=host.Event._Global_CustomEvent;
					if(map.hasOwnProperty(name)) map[name](args);	
				},
				bind:function(name,fun,cover){
					var map=host.Event._Global_CustomEvent;
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
					host.Event.ready();
				}, false );
				// If IE event model is used
				} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
					document.attachEvent("onreadystatechange", function(){
						if ( document.readyState === "complete" ) {
							document.detachEvent( "onreadystatechange", arguments.callee );
							host.Event.ready();
						}
					});
				// If IE and not an iframe
				// continually check to see if the document is ready
					if ( document.documentElement.doScroll && typeof window.frameElement === "undefined" ) (function(){
					if ( jQuery.isReady ) return;
						try {
						// If IE is used, use the trick by Diego Perini
						// http://javascript.nwbox.com/IEContentLoaded/
							document.documentElement.doScroll("left");
						} catch( error ) {
							setTimeout( arguments.callee, 0 );
							return;
						}
							// and execute any waiting functions
							host.Event.ready();
					})();
				}
				
				// A fallback to window.onload, that will always work
				//jQuery.event.add( window, "load", jQuery.ready );
			},
			
			ready:function(){
				host.Event._isDOMready=true;
				host._readyFnMap.push(fn);
				if(host._isDOMready){
					host.each(host._readyFnMap,function(index,fn){
						fn();
					});
				}
			},
			
			_isDOMready:false,
			
			DOMready:function(fn){
				if(host.Event._isDOMready) 
				host.Event._bindReady();
			}
		};
		
		return {
			_readyFnMap:[],
			_Global_CustomEvent:{},
			customEvent:_fn.customEvent
		};
		
	}();
	
	host.Event=Event;
	
})(lithe,document,window);