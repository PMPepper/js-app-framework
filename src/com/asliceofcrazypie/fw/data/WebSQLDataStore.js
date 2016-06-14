//#import com.asliceofcrazypie.fw.data.DataStore

//#class com.asliceofcrazypie.fw.data.WebSQLDataStore extends com.asliceofcrazypie.fw.data.DataStore
function( base ){
	var tableName = 'data';
	
	this.constructor = function( dataStoreName, genericSuccessHandler, genericErrorHandler, config ){
		base.constructor.call( this, dataStoreName, genericSuccessHandler, genericErrorHandler, config );
		
		this._addReadOnly( 'persistent', true );
		this._addReadOnly( 'remote', false );
		
		if( window.openDatabase )
		{
			try{
				var self = this;
				this._db = openDatabase(dataStoreName, '1.0', 'Datastore DB', 2 * 1024 * 1024 );
				
				this._db.transaction(function (tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS '+tableName+' (property unique, value)');
					
					self._trigger( 'init', true, null, self );
				});
			}
			catch( e )
			{
				this._trigger( 'init', false, null, e.message, this );
			}
		}
		else
		{
			this._trigger( 'init', false, null, 'WebSQL is not available.', this );
		}
	}
	
	/**
	 * Gets a value from the datastore
	 * successCallback will be function that takes the following arguments: value, property, this
	 * errorCallback will be function that takes the following arguments: error, property, this
	 */
	this.get = function( property, successCallback, errorCallback )
	{
		try{
			var self = this;
			
			this._db.transaction(function (tx) {
				tx.executeSql('SELECT * FROM '+tableName+' WHERE property = ?', [property], function (tx, result ){
					self._trigger( 'set', true, successCallback, result.rows.length ? JSON.parse( result.rows.item(0).value ) : null, property, self );
				},
				function( tx, error ){
					self._trigger( 'set', false, errorCallback, error.message, property, self );
				});
			});
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
		try{
			var self = this;
			
			this._db.transaction(function (tx) {
				tx.executeSql('REPLACE INTO '+tableName+' (property, value) VALUES ( ?, ?)', [property, JSON.stringify( value )], function (tx, result ){
					self._trigger( 'set', true, successCallback, value, property, self );
				},
				function( tx, error ){
					self._trigger( 'set', false, errorCallback, error.message, property, self );
				});
			});
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
		try{
			var self = this;
			
			this._db.transaction(function (tx) {
				tx.executeSql('DELETE FROM '+tableName+' WHERE property = ?', [property], function (tx, result ){
					self._trigger( 'remove', true, successCallback, property, self );
				},
				function( tx, error ){
					self._trigger( 'remove', false, errorCallback, error.message, property, self );
				});
			});
		}
		catch(e){
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
		try{
			var self = this;
			
			this._db.transaction(function (tx) {
				tx.executeSql('SELECT * FROM '+tableName, null, function (tx, result ){
					var properties = [];
					
					for( var i = 0,l = result.rows.length; i < l; i++ )
					{
						properties.push( result.rows.item(i).property );
					}
					
					self._trigger( 'getAll', true, successCallback, properties, self );
				},
				function( tx, error ){
					self._trigger( 'getAll', false, errorCallback, error.message, self );
				});
			});
		}
		catch(e){
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
		try{
			var self = this;
			
			this._db.transaction(function (tx) {
				tx.executeSql('DELETE FROM '+tableName, null, function (tx, result ){
					self._trigger( 'clear', true, successCallback, self );
				},
				function( tx, error ){
					self._trigger( 'clear', false, errorCallback, error.message, self );
				});
			});
		}
		catch(e){
			this._trigger( 'clear', false, errorCallback, e.message, this );
		}
	}
}