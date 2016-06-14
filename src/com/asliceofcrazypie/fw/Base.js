//#require libs.augment
//#require libs.functions

//#import com.asliceofcrazypie.fw.Core

//#class com.asliceofcrazypie.fw.Base
function(){
	var hash = 0;
	this.constructor = function(){
		//this.__isDisposed = false;
		Object.defineProperty(this, '__isDisposed', {configurable:false, writable:true, enumerable:false, value:false});
		
		this._addReadOnly( 'hash', hash++ );
	}
	
	this.dispose = function(){
		this.__isDisposed = true;
	}
	
    var defaultAccessorOptions = {configurable:false, enumerable:false, "private":false };
    
	this._addAccessor = function( prop, get, set, options ){
		options = Self.mergeObjects( defaultAccessorOptions, options )
		
		if( get && ( typeof( get ) == 'string' || !options["private"] ) )
		{
			var getFunc;
			
			if( typeof( get ) != 'string' )
			{
				getFunc = get;
				get = 'get_'+prop;
				this[get] = getFunc;
			}
			
			getFunc = function(){
				return this[arguments.callee.prop]();
			}
			
			getFunc.prop = get;
			get = getFunc;
		}
		
		if( set && ( typeof( set ) == 'string' || !options["private"] ) )
		{
			var setFunc;
			
			if( typeof( set ) != 'string' )
			{
				setFunc = set;
				set = 'set_'+prop;
				this[set] = setFunc;
			}
			
			setFunc = function( value ){
				return this[arguments.callee.prop]( value );
			}
			
			setFunc.prop = set;
			set = setFunc;
		}
		
		
		Object.defineProperty( this, prop, {
			get:get || undefined,
			set:set || undefined,
			configurable:options.configurable,
			enumerable:options.enumerable
		} );
	}
	
	/*if type is a string, compare using typeof, otherwise use instanceof.
	If type does not match, will throw an error*/
    var defaultTypedPropertyProps = {configurable:false, enumerable:true, allowNull:true };
    
	this._addTypedProperty = function( prop, type, value, options )
	{
		options = Self.mergeObjects( defaultTypedPropertyProps, options );
		
		var get = function(){
			return value;
		}
		
		var set = typeof( type ) == 'string' ? 
			function( newValue ){
				if( ( options.allowNull && newValue === null ) || typeof( newValue ) == type )
				{
					value = newValue;
				}
				else
				{
					if( options.allowNull )
					{
						throw new Error( 'Value must be null or of type "'+type+'" (was of type "'+typeof( newValue )+'")' );
					}
					else
					{
						throw new Error( 'Value must be of type "'+type+'" (was of type "'+typeof( newValue )+'")' );
					}
				}
			}
		:
			function( newValue ){
				if( ( options.allowNull && newValue === null ) || ( newValue instanceof type ) )
				{
					value = newValue;
				}
				else
				{
					if( options.allowNull )
					{
						throw new Error( 'Value must be null or of type "'+type+'" (was "'+newValue+'")' );
					}
					else
					{
						throw new Error( 'Value must be of type "'+type+'" (was "'+newValue+'")' );
					}
				}
			};
		;
			
		Object.defineProperty( this, prop, {
			get:get,
			set:set,
			configurable:options.configurable,
			enumerable:options.enumerable
		} );
	}
	
    var defaultReadOnlyProps = {configurable:false, enumerable:false };
    
	this._addReadOnly = function( prop, value, options )
	{
		options = Self.mergeObjects( defaultReadOnlyProps, options );
		
		Object.defineProperty( this, prop, {
			writable:options.writable,
			value:value,
			configurable:options.configurable,
			enumerable:options.enumerable
		} );
	}
	
	this.toString = function(){
		return '['+this.constructor.className+']'
	}
	
    Self.mergeObjects = function( target ){
        var obj,
            prop;
        
        for( var i = 1; i < arguments.length; i++ ){
            obj = arguments[i];
            
            for( prop in obj ){
                target[prop] = obj[prop];
            }
        }
        
        return target;
    }
}