//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.ds.ObjectPool extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( factory, maxSize, initSize, reset ){
		base.constructor.call( this );
		
		this._factory = factory;
		this._reset = reset;
		this._maxSize;
		
		initSize = initSize || maxSize;
		
		this._pool = [];
		this._pool.length = initSize;
		
		for( var i = 0; i < initSize; i++ )
		{
			this._pool[i] = factory();
		}
	}
	
	this.get = function(){
		if( this._pool.length > 0 )
		{
			return this._pool.pop();
		}
		else
		{
			return this._factory();
		}
	}
	
	this.put = function( obj ){
		if( this._reset instanceof Function )
		{
			this._reset( obj );
		}
		else if( obj.reset instanceof Function )
		{
			obj.reset();
		}
		
		if( this._pool.length < this._maxSize )
		{
			this._pool.push( obj );
		}
		else if( obj.dispose instanceof Function )
		{
			obj.dispose();
		}
	}
	
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