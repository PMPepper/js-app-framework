//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.ReadOnly extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( values, recursive ){
		base.constructor.call( this );
		
		for( var s in this ){
			if( typeof( this[s] ) == 'function' ){
				Object.defineProperty( this, s, { enumerable:false } );
			}
		}
		
		var value
		
		for( var s in values )
		{
			value = values[s];
			
			if( recursive){
				value = recursiveObjectParse( value );
			}
			
			this[s] = value;
		}
		
		Object.freeze( this );
	}
	
	function recursiveObjectParse ( value )
	{
		if( typeof( value ) == 'object' )
		{
			var newVal;
			
			if( value instanceof Array )
			{
				newVal = [];
				
				for( var i = 0; i < value.length; i++ )
				{
					newVal[i] = recursiveObjectParse( value[i] );
				}
				
			}
			else
			{
				newVal = {};
				for( var s in value )
				{
					newVal[s] = recursiveObjectParse( value[s] );
				}
			}
			
			Object.freeze( newVal );
			
			value = newVal;
		}
		
		return value;
	}
}