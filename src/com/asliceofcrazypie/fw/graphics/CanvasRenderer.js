//#import com.asliceofcrazypie.fw.graphics.Sprite
//#import com.asliceofcrazypie.fw.graphics.ARenderer
//import com.asliceofcrazypie.fw.geom.Rectangle

//#class com.asliceofcrazypie.fw.graphics.CanvasRenderer extends com.asliceofcrazypie.fw.graphics.ARenderer
function( base ){
	this.constructor = function( canvasElement, spriteRoot, viewport ){
		base.constructor.call( this, spriteRoot, viewport );
		
		this._addAccessor( 'canvasElement', function(){
				return this._canvasElement;
			},
			function( value )
			{
				if( value != this._canvasElement && ( value instanceof HTMLCanvasElement ) )
				{
					this._canvasElement = value;
					var viewport = this.viewport;
					
					//set the size of the canvas element
					value.width = viewport[0];
					value.height = viewport[1];
					this._context = value.getContext( '2d' );
				}
			}
		);
		
		this._addAccessor( 'autoclear', function(){
				return this._autoclear;
			},
			function( value ){
				if( value != this._autoclear )
				{
					this._autoclear = value;
				}
			}
		);
		
		this.autoclear = true;
		
		this.canvasElement = canvasElement;
	}
	
	this.render = function(frameTime){
		var viewport = this.viewport, root = this.root, context = this._context;
		
		if( context && viewport && root )//if there is something to render
		{
			//render
			if( this.autoclear )
			{
				context.clearRect( 0, 0, viewport[0], viewport[1] );
			}
			
			this._renderSprite( root, context );
			
			base.render.call( this, frameTime );
		}
	}
	
	this._renderSprite = function( sprite, context )
	{
		if( !sprite.visible )
		{
			return;//do not render sprites which are not visible
		}
		
		context.save();
		
		var matrix = sprite.matrix;
		var spriteDefinition = sprite.spriteDefinition;
		
		context.transform( matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7] );
		
		if( spriteDefinition )
		{
			context.drawImage( 
				spriteDefinition.image, 
				spriteDefinition.offsetX,
				spriteDefinition.offsetY,
				spriteDefinition.width,
				spriteDefinition.height,
				-spriteDefinition.centerX, 
				-spriteDefinition.centerY, 
				spriteDefinition.width,
				spriteDefinition.height
				
			);
		}
		
		//render all children
		sprite.forEachChild( function( sprite ){
			this._renderSprite( sprite, context );
		}, this);
		
		context.restore();
	}
}