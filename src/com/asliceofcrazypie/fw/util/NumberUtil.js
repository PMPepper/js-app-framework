//#import com.asliceofcrazypie.fw.Core

//#class com.asliceofcrazypie.fw.util.NumberUtil
function(){
	this.limit = function( value, min, max )
	{
		return value < min ? min : value > max ? max : value;
	}
	
	this.tryParse = function( str )
	{
		var num = parseFloat( str );
		
		return num == num ? num : str ;
	}
}