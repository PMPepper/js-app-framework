//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.geom.Rectangle extends com.asliceofcrazypie.fw.Base
function(base){
    this.constructor = function( x, y, width, height ){
		base.constructor.call( this );
		
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		
		this._isLocked = false;
		
		//TODO accessors and stuff
		this._addAccessor( 'left', function(){
				return this.x;
			},
			function( value ){
				var right = this.x + this.width;
				
				this.x = value;
				this.width = right - value;
			}
		);
		this._addAccessor( 'top', function(){
				return this.y;
			},
			function( value ){
				var bottom = this.y + this.height;
				
				this.y = value;
				this.height = bottom - value;
			}
		);
		this._addAccessor( 'right', function(){
				return this.x + this.width;
			},
			function( value ){
				this.width = value - this.x;
			}
		);
		this._addAccessor( 'bottom', function(){
				return this.y + this.height;
			},
			function( value ){
				this.height = value - this.y;
			}
		);
		
	}
	
	//ACPF.makeAutoPool( Self, 10, 1000 );
	
	this.clone = function(){
		return new Self( this.x, this.y, this.width, this.height );
	}
	
	this.equal = function( rect ){
		this.x = rect.x;
		this.y = rect.y;
		this.width = rect.width;
		this.height = rect.height;
		
		return this
	}
	
	var configurable = { configurable:true };
	var writable = { configurable:true, writable:true };
	
	this.lock = function(){
		try{
			this._isLocked = true;
			this._addReadOnly( 'x', this.x, configurable );
			this._addReadOnly( 'y', this.y, configurable );
			this._addReadOnly( 'width', this.width, configurable );
			this._addReadOnly( 'height', this.height, configurable );
		}
		catch(e){}//supress error if already locked
	}
	
	this.containsPoint = function( vector )
	{
		return this.x <= vector.x && this.y <= vector.y && ( this.x + this.width ) >= vector.x && ( this.y + this.height ) >= vector.y;
	}
	
	this.reset = function(){
		if( this._isLocked )
		{
			this._addReadOnly( 'x', 0, writable );
			this._addReadOnly( 'y', 0, writable );
			this._addReadOnly( 'width', 0, writable );
			this._addReadOnly( 'height', 0, writable );
			this._isLocked = false;
		}
		else
		{
			this.x = this.y = this.width = this.height = 0;
		}
	}
	
	Self.__init__ = function(){
		ACPF.makeAutoPool( Self, 10, 1000 );
	}
}