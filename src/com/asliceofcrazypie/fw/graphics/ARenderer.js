//#import com.asliceofcrazypie.fw.graphics.Sprite
//#import com.asliceofcrazypie.fw.geom.Rectangle
//#import com.asliceofcrazypie.fw.geom.Vector2

//#class com.asliceofcrazypie.fw.graphics.ARenderer extends com.asliceofcrazypie.fw.EventDispatcher
function( base ){
	this.constructor = function( spriteRoot, viewport ){
		base.constructor.call( this );
		
		this._rootDirty = false;
		this._viewportDirty = false;
		
		this._addAccessor( 'root', function(){
				return this._root;
			},
			function( value ){
				if( value != this._root )
				{
					this._root = value;
					this._rootDirty = true;
				}
			}
		);
		
		this._addAccessor( 'viewport', function(){
				return this._viewport;
			},
			function( value )
			{
				if( value != this._viewport && value && ( (!this._viewport) || ( value[0] != this._viewport[0] || value[1] != this._viewport[1] ) ) )
				{
					if( value[0] < 1 )
					{
						throw new Error( 'Viewport width must be greater than 0' );
					}
					
					if( value[1] < 1 )
					{
						throw new Error( 'Viewport height must be greater than 0' );
					}
					
					this._viewport = value;
					this._viewportDirty = true;
				}
			}
		);
		
		this.root = spriteRoot;
		this.viewport = viewport || vec2.set( vec2.create(), 640, 480 );
	}
	
	/*Will render the supplied sprites*/
	this.render = function( frameTime ){
		//To be called last when overridden!
		
		if( frameTime != 0 )
		{
			var root = this.root;
			
			if( root )
			{
				this.root.forEachDescendant( function(node){ if( node.update ){ node.update( frameTime ) } } );
			}
		}
		
		this._rootDirty = this._viewportDirty = false;
	}
}