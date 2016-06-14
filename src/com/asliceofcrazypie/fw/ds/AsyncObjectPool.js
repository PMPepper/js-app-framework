//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.ds.ObjectPool extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( factory, maxSize, initSize, reset ){
		base.constructor.call( this );
		
		this._factory = factory;
		this._reset = reset;
		this._maxSize;
		
		initSize = initSize || maxSize;
		
		//init the pool
		this._pool = [];
		
		var init = (function ( obj ){
			this._pool.push( obj );
		}).bind( this );
		
		for( var i = 0; i < initSize; i++ )
		{
			factory( init );
		}
	}
	
	//Callback method will be called with 1 argument - the object from the pool
	this.get = function( callback ){
		if( this._pool.length > 0 )
		{
			var obj = this._pool.pop();
			
			
			//decouple response to avoid race conditions
			window.requestAnimationFrame( function(){ callback( obj ); } );
		}
		else
		{
			//call factory method and pass callback
			this._factory( callback );
		}
	}
	
	this.put = function( obj ){
		if( this._reset instanceof Function )
		{
			this._reset( obj, this._put );
		}
		else if( obj.reset instanceof Function )
		{
			obj.reset( this._put );
		}
	}
	
	this._put = (function( obj ){
		if( this._pool.length < this._maxSize )
		{
			this._pool.push( obj );
		}
		else if( obj.dispose instanceof Function )
		{
			obj.dispose();
		}
	}).bind( this );
	
	this.dispose = function(){
		if( !this.__isDisposed )
		{
			//dispose of all pooled objects
			var obj;
			
			for( var i = this._pool.length-1; i > -1; --i )
			{
				obj = this._pool[i]
				
				if( obj.dispose instanceof Function )
				{
					obj.dispose();
				}
			}
			
			//clear local vars
			this._pool.length = 0;
			this._factory = this._reset = this._pool = null;
			
			base.dispose.call( this );
		}
	}
}