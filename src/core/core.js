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
	
})(this);




