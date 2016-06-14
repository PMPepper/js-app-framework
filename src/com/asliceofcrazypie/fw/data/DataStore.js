//#uses com.asliceofcrazypie.fw.data.IndexedDBDataStore
//#uses com.asliceofcrazypie.fw.data.LocalStorageDataStore
//#uses com.asliceofcrazypie.fw.data.RemoteDataStore
//#uses com.asliceofcrazypie.fw.data.VolatileDataStore
//#uses com.asliceofcrazypie.fw.data.WebSQLDataStore

//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.data.DataStore extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( dataStoreName, genericSuccessHandler, genericErrorHandler ){
		base.constructor.call( this );
		
		this._dataStoreName = dataStoreName;
		this._addTypedProperty( 'genericSuccessHandler', 'function', genericSuccessHandler );
		this._addTypedProperty( 'genericErrorHandler', 'function', genericErrorHandler );
	}
	
	this._trigger = function( event, success, handler ){
		var generic = success ? this.genericSuccessHandler : this.genericErrorHandler;
		
		if( typeof( handler ) == 'function' )
		{
			handler( arguments[3], arguments[4], arguments[5] );
		}
		else if( typeof( generic ) == 'function' )
		{
			generic( event, arguments[3], arguments[4], arguments[5] );
		}
	}
	
	/**
	 * Gets a value from the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.get = function( property, successCallback, errorCallback )
	{
		
	}
	
	/**
	 * sets a value in the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.set = function( property, value, successCallback, errorCallback )
	{
		
	}
	
	/**
	 * removes an item from the datastore
	 * successCallback will be function that takes the following arguments: property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.remove = function( property, successCallback, errorCallback )
	{
		
	}
	
	/**
	 * Returns an array of all keys in the datastore
	 * successCallback will be function that takes the following arguments: properties, this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.getAll = function( successCallback, errorCallback )
	{
		
	}
	
	/**
	 * Deletes everything in the datastore
	 * successCallback will be function that takes the following arguments: this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.clear = function( successCallback, errorCallback )
	{
		
	}
	
	/**
	 * Called whne datastore is finised with. Does tidy up, etc.
	 */
	this.dispose = function(){
		this.genericSuccessHandler = this.genericErrorHandler = null
	}
	
	//static methods
	//normalise LocalStorage
	Self.localStorage = window.localStorage || window.mozLocalStorage || window.webkitLocalStorage || window.msLocalStorage || window.oLocalStorage;

	//normalise indexedDB
	Self.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.oIndexedDB;
	//Self.iDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange || window.oIDBKeyRange;
	
	
	//A method to get a dataStore. callback is a function that gets called once a DataStore has been found, or none can be found
	//callback will either be called with null as teh first argument (if not datastore available), or the created datastore.
	Self.get = function( dataStoreName, callback, genericSuccessHandler, genericErrorHandler, config )
	{
		config = $.extend( { orderPreference:null }, config );
		var orderPreference = config.orderPreference || ['webSQL','indexedDB','localStorage', 'remote', 'volatile'];
		
		function getProviderSuccess( method, provider ){
			//swap out success/error handlers
			provider.genericSuccessHandler = genericSuccessHandler || null;
			provider.genericErrorHandler = genericErrorHandler || null;
			
			//call success handler
			callback( provider );
		}
		
		function getProviderError( method, error, provider ){
			if( provider )
			{
				provider.dispose();
			}
			
			//if at first you don't succeed!
			tryGetNextDataStoreProvider();
		}
		
		function tryGetNextDataStoreProvider(){
			if(orderPreference.length > 0)
			{
				var dataStoreProvider = orderPreference.shift();
				var providerConfig = config[dataStoreProvider];
				
				switch( dataStoreProvider )
				{
					case 'webSQL':
						new ( getClassByQualifiedName( 'com.asliceofcrazypie.data.WebSQLDataStore' ) )( dataStoreName, getProviderSuccess, getProviderError, config);
						return;
					case 'indexedDB':
						new ( getClassByQualifiedName( 'com.asliceofcrazypie.data.IndexedDBDataStore' ) )( dataStoreName, getProviderSuccess, getProviderError, config);
						return;
					case 'localStorage':
						new ( getClassByQualifiedName( 'com.asliceofcrazypie.data.LocalStorageDataStore' ) )( dataStoreName, getProviderSuccess, getProviderError, config);
						return;
					case 'remote':
						new ( getClassByQualifiedName( 'com.asliceofcrazypie.data.RemoteDataStore' ) )( dataStoreName, getProviderSuccess, getProviderError, config);
						return;
					case 'volatile':
						new ( getClassByQualifiedName( 'com.asliceofcrazypie.data.VolatileDataStore' ) )( dataStoreName, getProviderSuccess, getProviderError, config);
						return;
					default:
						tryGetNextDataStoreProvider();//whatever this provider was, it's not been found. Try the next one
				}
			}
			else
			{
				callback( null );
			}
		}
		
		tryGetNextDataStoreProvider();
	}
}