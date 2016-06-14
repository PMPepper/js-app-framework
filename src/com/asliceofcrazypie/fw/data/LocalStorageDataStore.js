//#import com.asliceofcrazypie.fw.data.DataStore

//#class com.asliceofcrazypie.fw.data.LocalStorageDataStore extends com.asliceofcrazypie.fw.data.DataStore
function( base ){
	
	
	var localStorage = DataStore.localStorage;
	
	this.constructor = function( dataStoreName, genericSuccessHandler, genericErrorHandler, config ){
		base.constructor.call( this, dataStoreName, genericSuccessHandler, genericErrorHandler, config );
		
		this._addReadOnly( 'persistent', true );
		this._addReadOnly( 'remote', false );
		
		if( localStorage )
		{
			this._trigger( 'init', true, null, this );
		}
		else
		{
			this._trigger( 'init', false, null, 'localStorage is not available.', this );
		}
	}
	
	//internal methods
	this._trigger = function( event, success, handler ){
		//decouple execution
		setTimeout( base._trigger.bind( this, event, success, handler, arguments[3], arguments[4], arguments[5] ), 100 );
	}
	
	this._propertyName = function( property ){
		return this._dataStoreName + '|#|' + property;
	}
	
	this._getAll = function(){
		var properties = [], property, dataStoreProp = this._dataStoreName + '|#|', dataStorePropLength = dataStoreProp.length;
		
		for( var i = 0; i < localStorage.length; i++ )
		{
			property = localStorage.key( i );
			
			if( property.indexOf( dataStoreProp ) == 0 )
			{
				properties.push( property.substr( dataStorePropLength ) );
			}
		}
		
		return properties;
	}
	
	/**
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.get = function( property, successCallback, errorCallback )
	{
		try
		{
			var value = localStorage.getItem( this._propertyName( property ) );
			
			if( typeof( value ) == 'string' )
			{
				value = JSON.parse( value );
			}
			
			this._trigger( 'get', true, successCallback, value, property, this );
		}
		catch(e)
		{
			this._trigger( 'get', false, errorCallback, e.message, property, this );
		}
	}
	
	/**
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.set = function( property, value, successCallback, errorCallback )
	{
		try
		{
			localStorage.setItem( this._propertyName( property ), JSON.stringify( value ) );
			
			this._trigger( 'set', true, successCallback, value, property, this );
		}
		catch(e)
		{
			this._trigger( 'set', false, errorCallback, e.message, property, this );
		}
	}
	
	/**
	 * removes an item from the datastore
	 * successCallback will be function that takes the following arguments: property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.remove = function( property, successCallback, errorCallback )
	{
		try
		{
			localStorage.removeItem( this._propertyName( property ) );
			
			this._trigger( 'remove', true, successCallback, property, this );
		}
		catch(e)
		{
			this._trigger( 'remove', false, errorCallback, e.message, property, this );
		}
	}
	
	/**
	 * Returns an array of all keys in the datastore
	 * successCallback will be function that takes the following arguments: properties, this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.getAll = function( successCallback, errorCallback )
	{
		try
		{
			var properties = this._getAll();
			
			this._trigger( 'getAll', true, successCallback, properties, this );
		}
		catch(e)
		{
			this._trigger( 'getAll', false, errorCallback, e.message, this );
		}
	}
	
	/**
	 * Deletes everything in the datastore
	 * successCallback will be function that takes the following arguments: this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.clear = function( successCallback, errorCallback )
	{
		try
		{
			var properties = this._getAll();
			
			for( var i = 0; i < properties.length; i++ )
			{
				this.remove( properties[i] );
			}
			
			this._trigger( 'clear', true, successCallback, this );
		}
		catch(e)
		{
			this._trigger( 'clear', false, errorCallback, e.message, this );
		}
	}
}