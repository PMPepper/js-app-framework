//#import com.asliceofcrazypie.fw.data.DataStore

//#class com.asliceofcrazypie.fw.data.IndexedDBDataStore extends com.asliceofcrazypie.fw.data.DataStore
function( base ){
	var indexedDB = DataStore.indexedDB;
	//var iDBKeyRange = DataStore.iDBKeyRange;
	
	var tableName = 'data';
	
	this.constructor = function( dataStoreName, genericSuccessHandler, genericErrorHandler, config ){
		base.constructor.call( this, dataStoreName, genericSuccessHandler, genericErrorHandler, config );
		
		this._addReadOnly( 'persistent', true );
		this._addReadOnly( 'remote', false );
		
		if( indexedDB ){
		
			try{
				this._request = indexedDB.open(dataStoreName, 1);
				
				var self = this;
				
				this._request.onerror = function(event) {
					self._trigger( 'init', false, null, event.target.error.message, self );
				};
				
				this._request.onupgradeneeded = function(event) {
					var db = event.target.result;
					var objectStore = db.createObjectStore( tableName );
				}
				
				this._request.onsuccess = function(event) {
					self._db = event.target.result;
					self._trigger( 'init', true, null, self );
				};
			}
			catch( e )
			{
				this._trigger( 'init', false, null, e.message, this );
			}
		}
		else
		{
			this._trigger( 'init', false, null, 'IndexedDB is not available.', this );
		}
	}
	
	/**
	 * Gets a value from the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.get = function( property, successCallback, errorCallback )
	{
		var self = this;
		
		try{
			var transaction = this._db.transaction([tableName]);
			
			var objectStore = transaction.objectStore(tableName);
			var request = objectStore.get(property);
			
			request.onsuccess  = function(event) {
				self._trigger( 'get', true, successCallback, request.result, property, self );
			};
			
			request.onerror = function(event) {
				self._trigger( 'get', false, errorCallback, event.target.error.message, property, self );
			};
		}
		catch(e){
			this._trigger( 'get', false, errorCallback, e.message, property, this );
		}
			
	}
	
	/**
	 * sets a value in the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.set = function( property, value, successCallback, errorCallback )
	{
		var self = this;
		
		try{
			var transaction = this._db.transaction([tableName], "readwrite");
			
			var objectStore = transaction.objectStore(tableName);
			
			transaction.oncomplete = function(event) {
				self._trigger( 'set', true, successCallback, value, property, self );
			};
			
			transaction.onerror = function(event) {
				self._trigger( 'set', false, errorCallback, event.target.error.message, property, self );
			};
			
			//actually perform the add operation
			objectStore.put( value, property );
		}
		catch(e){
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
		var self = this;
		
		try{
			var request = this._db.transaction([tableName], "readwrite")
			.objectStore(tableName)
			.delete(property);
			
			request.onsuccess = function(event) {
				self._trigger( 'remove', true, successCallback, property, self );
			};
			
			request.onerror = function(event) {
				self._trigger( 'remove', false, errorCallback, event.target.error.message, property, self );
			};
		}
		catch(e){
			this._trigger( 'set', false, errorCallback, e.message, property, this );
		}
	}
	
	/**
	 * Returns an array of all keys in the datastore
	 * successCallback will be function that takes the following arguments: properties, this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.getAll = function( successCallback, errorCallback )
	{
		try{
			var self = this;
			var objectStore = this._db.transaction(tableName).objectStore(tableName);
			var properties = [];
			
			var cursor = objectStore.openCursor();
			
			cursor.onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					properties.push(cursor.key);
					cursor.continue();
				}
				else {
					self._trigger( 'getAll', true, successCallback, properties, self );
				}
			};
			
			cursor.onerror = function(event){
				self._trigger( 'getAll', false, errorCallback, event.target.error.message, property, self );
			}
		}
		catch(e){
			this._trigger( 'getAll', false, errorCallback, e.message, property, this );
		}
	}
	
	/**
	 * Deletes everything in the datastore
	 * successCallback will be function that takes the following arguments: this
	 * errorCallback will be function that takes the following arguments: error, this
	 */
	this.clear = function( successCallback, errorCallback )
	{
		try{
			var self = this;
			var objectStore = this._db.transaction(tableName, "readwrite").objectStore(tableName);
			
			var request = objectStore.clear();
			
			request.onsuccess = function(event) {
				self._trigger( 'clear', true, successCallback, self );
			};
			
			request.onerror = function(event) {
				self._trigger( 'clear', false, errorCallback, event.target.error.message, self );
			};
			
		}
		catch(e){
			this._trigger( 'clear', false, errorCallback, e.message, this );
		}
	}
}