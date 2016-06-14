//#import com.asliceofcrazypie.fw.graphics.Sprite

//#class com.asliceofcrazypie.fw.graphics.Animation extends com.asliceofcrazypie.fw.graphics.Sprite
function( base ){
	this.constructor = function( spriteDefinitions, initVars ){
		this._elapsedTime = 0;
		this._spriteDefinitions = spriteDefinitions;
		this._pause = false;
		this._speed = 1;
		
		this._addAccessor( 'numFrames', function(){ return this._spriteDefinitions.length; } )
		this._addAccessor( 'pause',
			function(){
				return this._pause;
			},
			function(value){
				value = !!value;
				
				if( value != this._pause )
				{
					this._pause = value;
				}
			}
		);
		
		this._addAccessor( 'speed',
			function(){
				return this._speed;
			},
			function(value){
				if( typeof( value ) == 'number' && value === value && value != this._speed )
				{
					this._elapsedTime = ( this._elapsedTime * this._speed ) / value;
					this._speed = value;
				}
			}
		);
		
		this._addAccessor( 'fps',
			function(){
				return this._fps;
			},
			function(value){
				if( typeof( value ) == 'number' && value === value && value != this._fps )
				{
					//TODO adjust current position to compensate
					this._fps = value;
				}
			}
		);
		
		this.fps = 60;//default to 60
		
		base.constructor.call( this, spriteDefinitions ? spriteDefinitions[0] : null, initVars );
		
	}
	
	this.update = function(frameTime)
	{
		this._elapsedTime += frameTime * this.speed;
		var numFrames = this.numFrames, fps = this.fps;
		var playbackTime = numFrames / fps;
		
		var frameIndex = this._elapsedTime % playbackTime;
		
		if( frameIndex < 0 )
		{
			frameIndex += numFrames;
		}
		
		frameIndex = Math.floor( frameIndex * fps );
		
		this.spriteDefinition = this._spriteDefinitions[frameIndex];
	}
}