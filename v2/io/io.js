lithe.define('io',function(){
	var io=function(arg1,callback){
		console.log(arg1);
		if(callback) callback();
	}
	lithe.namespace.io=io;
});
