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
	
})(lithe,document);