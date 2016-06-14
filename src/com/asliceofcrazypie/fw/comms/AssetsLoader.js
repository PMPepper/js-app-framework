//#import com.asliceofcrazypie.fw.EventDispatcher
//#import com.asliceofcrazypie.fw.util.StringUtil

//#class com.asliceofcrazypie.fw.comms.AssetsLoader extends com.asliceofcrazypie.fw.EventDispatcher
function( base )
{
	var MAX_LOAD_ATTEMPTS = 3;
	var error = {};
	
	this.constructor = function( assets, path ){
		base.constructor.call( this );
		
		this._assets = assets;
		this._path = path;
		this._assetsToLoad = this._assetsLoaded = this._assetsFailed = 0;
		
		this._loadingAssets = {};//the asset loading objects
		this._loadedAssets = {};//the assets that have been loaded
		
		this._autoTrigger( Self.COMPLETE, autoTriggerComplete.bind( this ) );
		
		this._complete = (function( asset ){
			this._assetsLoaded++;
			this._loadedAssets[asset.id] = asset.asset;
			this.dispatchEvent( {type:Self.ASSET_COMPLETE, id:asset.id, path:asset.path, asset_type:asset.type} );
			
			this._afterAsset( asset );
		}).bind( this );
		
		this._failed = (function( asset, error ){
			this._assetsFailed++;
			this._loadedAssets[asset.id] = error;
			this.dispatchEvent( {type:Self.ASSET_ERROR, id:asset.id, path:asset.path, asset_type:asset.type, error:error } );
			
			this._afterAsset( asset );
		}).bind( this );
		
		for( var i = 0; i < assets.length; i++ )
		{
			this._parseAsset( assets[i] )
		}
		
		this._addAccessor( 'isComplete', function(){ return this._assetsToLoad == ( this._assetsLoaded + this._assetsFailed ) } );
	}
	
	//public
	this.isAssetLoaded = function( id )
	{
		var asset = this._loadedAssets[id];
		
		return asset == error || typeof( asset ) == 'undefined' ? false : true;
	}
	
	this.getAsset = function( id )
	{
		var asset = this._loadedAssets[id];
		
		return asset == error ? null : asset;
	}
	
    this.getAssets = function( regex ){
        var assets = {};
        
        for( var asset in this._loadedAssets ){
            if( asset.match( regex ) ){
                assets[asset] = this._loadedAssets[asset];
            }
        }
        
        return assets;
    }
    
	//public static
	Self.ASSET_ERROR = 'asseterror';
	Self.ASSET_COMPLETE = 'assetcomplete';
	
	Self.STARTED = 'started';
	Self.PROGRESS = 'progress';
	Self.COMPLETE = 'complete';
	
	//private methods
	function autoTriggerComplete(){
		if( this.isComplete )
		{
			return {type:Self.COMPLETE, total:this._assetsToLoad, complete:this._assetsLoaded, failed:this._assetsFailed};
		}
		
		return false;
	}
	
	this._afterAsset = function( asset ){
		var pending = this._assetsToLoad-(this._assetsLoaded + this._assetsFailed);
		
		delete this._loadingAssets[asset.id];
		asset.dispose();
		
		if( pending +1 == this._assetsToLoad )
		{
			this.dispatchEvent( {type:Self.STARTED, total:this._assetsToLoad, complete:this._assetsLoaded, failed:this._assetsFailed, pending:pending} );
		}
		
		this.dispatchEvent( {type:Self.PROGRESS, total:this._assetsToLoad, complete:this._assetsLoaded, failed:this._assetsFailed, pending:pending} );
		
		if( pending == 0 ){
			this.dispatchEvent( {type:Self.COMPLETE, total:this._assetsToLoad, complete:this._assetsLoaded, failed:this._assetsFailed} );
		}
	}
	
	this._parseAsset = function( asset ){
		switch( asset.type )
		{
			case 'image':
			case 'xml':
			case 'txt':
			case 'json':
			case 'ini':
				this._loadAsset( asset.type, asset.path, asset.id );
				break;
			case 'images':
			case 'xmls':
			case 'txts':
			case 'jsons':
			case 'inis':
            case 'zips':
				this._parseAssetGroup( asset );
                break;
            case 'zip':
                if( global.JSZip ){
                    this._loadAsset( asset.type, asset.path, asset.id );
                } else{
                    throw new Error( 'JSZip required to load zip files' );
                }
				break;
			default:
				//unknown asset type
		}
	}
	
	this._loadAsset = function( type, path, id, base )
	{
		base = base || '';
		
		if( typeof( path ) == 'object' && path.pattern )
		{
			//parse pattern
			var pattern = path.pattern;
			var start = path.start || 0;
			var end = path.end;
			var id = path.id || pattern;
			
			for( var i = start; i <= end; i++ )
			{
				this._loadAsset( type, base + pattern.replace( '%', i ), id.replace( '%', i ) );
			}
		}
		else
		{
			id = id || path;
			this._assetsToLoad++;
			base = this._path + base;
			
			var asset;
			
			switch( type )
			{
				case 'image':
					asset = ImgLoadingAsset;
					break;
				case 'xml':
					asset = XmlLoadingAsset;
					break;
				case 'txt':
					asset = TxtLoadingAsset;
					break;
				case 'json':
					asset = JsonLoadingAsset;
					break;
				case 'ini':
					asset = IniLoadingAsset;
					break;
                case 'zip':
                    asset = ZipLoadingAsset;
                    break;
				default:
					return;
			}
			
			if( asset )
			{
				this._loadingAssets[id] = new asset( base + path, id, this._complete, this._failed );
			}
		}
	}
	
	this._parseAssetGroup = function( group )
	{
		var type = group.type.substr( 0, group.type.length-1 );
		var base = group.base || '';
		var paths = group.paths;
		
		if( paths.length )
		{
			for( var i = 0; i < paths.length; i++ )
			{
				this._loadAsset( type, paths[i], null, base );
			}
		}
		else//key/value pairs
		{
			for( var id in paths )
			{
				this._loadAsset( type, paths[id], id, base );
			}
		}
	}
	
	var LOAD_STATUS_INIT = 'init';
	var LOAD_STATUS_LOADING = 'loading';
	var LOAD_STATUS_LOADED = 'loaded';
	var LOAD_STATUS_RETRYING = 'retrying';
	var LOAD_STATUS_FAILED = 'failed';
	
	function ALoadingAsset( path, id, successCallback, failureCallback ){
		this.path = path;
		this.id = id;
		this.attempts = 0;
		this.loadStatus = LOAD_STATUS_INIT;
		this.asset = null;//should be set to loaded asset
		
		this.successCallback = successCallback;
		this.failureCallback = failureCallback;
	}
	
	ALoadingAsset.prototype = {
		start:function(){
			if( this.loadStatus != LOAD_STATUS_INIT )
			{
				return;
			}
			
			this.loadStatus = ( this.attempts == 0 ) ? LOAD_STATUS_LOADING : LOAD_STATUS_RETRYING ;
			
			this.attempts++;
			
			this._load();
		},
		error:function( error ){
			if( this.attempts < MAX_LOAD_ATTEMPTS )
			{
				this.loadStatus = LOAD_STATUS_INIT;
				this.start();
			}
			else
			{
				this.loadStatus = LOAD_STATUS_FAILED;
				error = error.type || error;
				
				if( error == 'error' )
				{
					error = 'load failed';
				}
				
				this.failureCallback( this, error );
			}
		},
		complete:function(){//called after loading has succeeded
			if( this.isLoading )
			{
				this.loadStatus = LOAD_STATUS_LOADED;
				this.successCallback( this );
			}
		},
		dispose:function(){
			this.asset = this.failureCallback = this.successCallback = null;
		},
		get isLoaded(){
			return this.loadStatus == LOAD_STATUS_LOADED;
		},
		get isLoading(){
			return this.loadStatus != LOAD_STATUS_LOADED && this.loadStatus != LOAD_STATUS_FAILED;
		},
		get isFailed(){
			return this.loadStatus == LOAD_STATUS_FAILED;
		}
	};
	
	function ImgLoadingAsset( path, id, successCallback, failureCallback )
	{
		ALoadingAsset.apply( this, arguments );
		this.type = 'image';
		this.start();
	}
	
	ImgLoadingAsset.prototype = new ALoadingAsset();
	ImgLoadingAsset.prototype._loaded = function( img ){
		if( img.naturalWidth == 0 || img.naturalHeight == 0 ){
			img.onerror('image invalid');//if image is not valid, treat it as a failed load
			return
		}
		
		this.asset = img;
		img.onload = img.onerror = null;
		
		this.complete();
	};
	ImgLoadingAsset.prototype._load = function(){
		var img = new Image();
		img.onload = this._loaded.bind( this, img );
		img.onerror = this.error.bind( this );
		img.src = this.path;
	}
	
	//XML loader
	function XmlLoadingAsset( path, id, successCallback, failureCallback )
	{
		ALoadingAsset.apply( this, arguments );
		this.type = 'xml';
		this.start();
	}
	
	XmlLoadingAsset.prototype = new ALoadingAsset();
	XmlLoadingAsset.prototype._load = function(){
		var self = this;
		
		$.ajax( this.path, {dataType:'xml' } ).then(
			function( data, textStatus, jqXHR ){
				self.asset = data;
				self.complete();
			},
			function( jqXHR, textStatus, errorThrown ) 
			{
				self.error( textStatus );
			}
		);
	}
	
	//TXT loader
	function TxtLoadingAsset( path, id, successCallback, failureCallback )
	{
		ALoadingAsset.apply( this, arguments );
		this.type = 'txt';
		this.start();
	}
	
	TxtLoadingAsset.prototype = new ALoadingAsset();
	TxtLoadingAsset.prototype._load = function(){
		var self = this;
		
		$.ajax( this.path, {dataType:'text' } ).then(
			function( data, textStatus, jqXHR ){
				self.asset = data;
				self.complete();
			},
			function( jqXHR, textStatus, errorThrown ) 
			{
				self.error( textStatus );
			}
		);
	}
	
	//JSON loader
	function JsonLoadingAsset( path, id, successCallback, failureCallback )
	{
		ALoadingAsset.apply( this, arguments );
		this.type = 'json';
		this.start();
	}
	
	JsonLoadingAsset.prototype = new ALoadingAsset();
	JsonLoadingAsset.prototype._load = function(){
		var self = this;
		
		$.ajax( this.path, {dataType:'json' } ).then(
			function( data, textStatus, jqXHR ){
				self.asset = data;
				self.complete();
			},
			function( jqXHR, textStatus, errorThrown ) 
			{
				self.error( textStatus );
			}
		);
	}
	
	//INI loader
	function IniLoadingAsset( path, id, successCallback, failureCallback )
	{
		ALoadingAsset.apply( this, arguments );
		this.type = 'ini';
		this.start();
	}
	
	IniLoadingAsset.prototype = new ALoadingAsset();
	IniLoadingAsset.prototype._load = function(){
		var self = this;
		
		$.ajax( this.path, {dataType:'text' } ).then(
			function( data, textStatus, jqXHR ){
				try{
					self.asset = StringUtil.parseSimpleConfigStr( data );
					self.complete();
				}
				catch(e){
					self.error( 'parsing error' );
				}
			},
			function( jqXHR, textStatus, errorThrown ) 
			{
				self.error( textStatus );
			}
		);
	}
    
    //ZIP loader
    function ZipLoadingAsset( path, id, successCallback, failureCallback )
	{
		ALoadingAsset.apply( this, arguments );
		this.type = 'zip';
		this.start();
	}
	
	ZipLoadingAsset.prototype = new ALoadingAsset();
	ZipLoadingAsset.prototype._load = function(){
		var self = this;
		
        JSZipUtils.getBinaryContent( this.path, function(err, data) {
            if(err) {
                self.error( err );
            } else {
                self.asset = new JSZip(data);
                self.complete();
            }
        });
	}
}