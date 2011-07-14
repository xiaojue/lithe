/**
 * @author longxiao.fq
 * dom.js
 * 可做优化
 */
(function(host,doc){
	
	var DOM=function(){
		
		var _fn={
				/**
				 * 支持类型
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
					//处理单个选择符的多种情况
					if(indexid!=-1){
						//如果有#直接返回
						return [doc.getElementById(id)];	
					}else if(indexcls!=-1 && indexcls!=0){
						//有cls并且含有tag
						return that._getElementsByClassName(cls,parent,tag);	
					}else if(indexcls!=-1 && indexcls==0){
						//含有cls，并且仅有cls
						return that._getElementsByClassName(text.slice(1),parent);	
					}else{
						//只含有tag
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
						order=[], //选择器序列	
						result,
						results;	
								
					if(typeof(selectors)!='string') return null;
					
					//首先按照空格分组
					order=selectors.split(' ');
					
					//先找第一个id，确定序列的最高级
					//如果没有id则找tag，
					//如果没有tag则找class
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
					//确定最后的序列,排除多ID情况
					order=realselector.slice(1).split(' ').reverse();
					
					if(order.length==1){
						//没空格，单选择的直接返回值
						return that._findChild(doc,order[0]);
					}else{
						//多个空格的迭代寻找
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
	
})(lithe,document);