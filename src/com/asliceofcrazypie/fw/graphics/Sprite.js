//#import com.asliceofcrazypie.fw.ds.EventNode
//#import com.asliceofcrazypie.fw.graphics.SpriteDefinition

//TODO remove this dependency?
//#require libs.glmatrix-2.2.0

//#class com.asliceofcrazypie.fw.graphics.Sprite extends com.asliceofcrazypie.fw.ds.EventNode
function( base ){
	this.constructor = function( spriteDefinition, initVars ){
		base.constructor.call( this );
		
		this._x = this._y = this._rotation = 0;
		this._scaleX = this._scaleY = this._opacity = 1; 
		this._visible = true;
		
		this._dirty = true;
		this._addAccessor( 'spriteDefinition', function(){
				return this._spriteDefinition;
			},
			function( value )
			{
				if( value != this._spriteDefinition )
				{
					this._spriteDefinition = value;
					this._dirty = true;
				}
			} 
		);
		
		this.spriteDefinition = spriteDefinition;
		
		
		this._addAccessor( 'visible', function(){
				return this._visible;
			},
			function( value )
			{
				if( value != this._visible )
				{
					this._visible = value;
					this._dirty = true;
				}
			} 
		);
		
		this._addAccessor( 'x', function(){
				return this._x;
			},
			function( value )
			{
				if( value != this._x )
				{
					this._x = value;
					this._dirty = true;
				}
			} 
		);
		this._addAccessor( 'y', function(){
				return this._y;
			},
			function( value )
			{
				if( value != this._y )
				{
					this._y = value;
					this._dirty = true;
				}
			} 
		);
		this._addAccessor( 'scaleX', function(){
				return this._scaleX;
			},
			function( value )
			{
				if( value != this._scaleX )
				{
					this._scaleX = value;
					this._dirty = true;
				}
			} 
		);
		this._addAccessor( 'scaleY', function(){
				return this._scaleY;
			},
			function( value )
			{
				if( value != this._scaleY )
				{
					this._scaleY = value;
					this._dirty = true;
				}
			} 
		);
		this._addAccessor( 'rotation', function(){
				return this._rotation;
			},
			function( value )
			{
				if( value != this._rotation )
				{
					this._rotation = value;
					this._dirty = true;
				}
			} 
		);
		this._addAccessor( 'degrees', function(){
				return this._rotation * 57.295779513082320876798154814105;
			},
			function( value )
			{
				value *= 0.01745329251994329576923690768489;
				
				if( value != this._rotation )
				{
					this._rotation = value;
					this._dirty = true;
				}
			} 
		);
		this._addAccessor( 'width', function(){
				return this.spriteDefinition.width * this.scaleX;
			},
			function( value )
			{
				this.scaleX = value / this.spriteDefinition.width;
			} 
		);
		this._addAccessor( 'height', function(){
				return this.spriteDefinition.height * this.scaleY;
			},
			function( value )
			{
				this.scaleY = value / this.spriteDefinition.height;
			} 
		);
		this._addAccessor( 'opacity', function(){
				return this._opacity;
			},
			function( value )
			{
				if( value != this._opacity )
				{
					this._opacity = value;
					this._dirty = true;
				}
			} 
		);
		
		this._matrix = mat3.create();
		
		this._addAccessor( 'matrix', function(){
				if( this._dirty )
				{
					var matrix = this._matrix;
					//debugger;
					// recalculate matrix;
					mat3.identity( matrix );
					
					vec2.set( v2, this._x, this._y );
					mat3.translate( matrix, matrix, v2 );
					
					mat3.rotate( matrix, matrix, this._rotation );
					
					vec2.set( v2, this._scaleX, this._scaleY );
					mat3.scale( matrix, matrix, v2 );
					
					this._dirty = false;
				}
			
				return this._matrix;
			}
		);
		
		if( initVars )
		{
			for( var prop in initVars )
			{
				this[prop] = initVars[prop];
			}
		}
	}
	
	var v2 = vec2.create();
}