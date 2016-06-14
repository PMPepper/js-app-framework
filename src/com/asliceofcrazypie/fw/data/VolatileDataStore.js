//#import com.asliceofcrazypie.fw.data.DataStore

//#class com.asliceofcrazypie.fw.data.VolatileDataStore extends com.asliceofcrazypie.fw.data.DataStore
function( base ){
	this.constructor = function( dataStoreName, genericSuccessHandler, genericErrorHandler, config ){
		base.constructor.call( this, dataStoreName, genericSuccessHandler, genericErrorHandler, config );
		
		this._addReadOnly( 'persistent', false );
		this._addReadOnly( 'remote', false );
		
		this._vars = {};
		
		this._trigger( 'init', true, null, this );
	}
	
	//internal methods
	this._trigger = function( event, success, handler ){
		//decouple execution
		setTimeout( base._trigger.bind( this, event, success, handler, arguments[3], arguments[4], arguments[5] ), 1 );
	}
	
	/**
	 * Gets a value from the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.get = function( property, successCallback, errorCallback )
	{
		this._trigger( 'get', true, successCallback, this._vars[property], property, this );
	}
	
	/**
	 * sets a value in the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.set = function( property, value, successCallback, errorCallback )
	{
		this._vars[property] = value;
		
		this._trigger( 'set', true, successCallback, value, property, this );
	}
	
	/**
	 * removes an item from the datastore
	 * successCallback will be function that takes the following arguments: property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.remove = function( property, successCallback, errorCallback )
	{
		delete this._vars[property];
		
		this._trigger( 'remove', true, successCallback, property, this );
	}
	
	/**
	 * Returns an array of all keys in the datastore
	 * successCallback will be function that takes the following arguments: properties, this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.getAll = function( successCallback, errorCallback )
	{
		var properties = [];
		
		for( var s in this._vars )
		{
			properties.push( s );
		}
		
		this._trigger( 'getAll', true, successCallback, properties, this );
	}
	
	/**
	 * Deletes everything in the datastore
	 * successCallback will be function that takes the following arguments: this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.clear = function( successCallback, errorCallback )
	{
		for( var s in this._vars )
		{
			delete this._vars[s];
		}
		
		this._trigger( 'clear', true, successCallback, this );
	}
}