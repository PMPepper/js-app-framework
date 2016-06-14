/*JS utilities, for dealing with language features, etc*/

//#import com.asliceofcrazypie.fw.Core

//#class com.asliceofcrazypie.fw.util.JSUtil
function(){
	var slice = Array.prototype.slice;
	
	this.toArray = function( args )
	{
		return slice.call(arguments, 0);
	}
}