//#import com.asliceofcrazypie.fw.graphics.Sprite
//#import com.asliceofcrazypie.fw.graphics.Animation

//#class com.asliceofcrazypie.fw.graphics.Skeleton extends com.asliceofcrazypie.fw.graphics.Animation
function( base ){
	this.constructor = function( skeletonParts, skeletonDefinition, initVars ){
		base.constructor.call( this, null, initVars );
		
		this._skeletonDefinition = skeletonDefinition;
		
		this._skeletonParts = skeletonParts;
		
		for( var name in skeletonParts )
		{
			skeletonParts[name].visible = false;
			this.addChild( skeletonParts[name] );
		}
		
		/*var skeletonPartDefinition;
		
		for( var name in skeletonPartDefinitions )
		{
			skeletonPartDefinition = skeletonPartDefinitions[name];
			
			if( skeletonPartDefinition instanceof Array )
			{
				this._skeletonParts[name] = new Animation( skeletonPartDefinition );
			}
			else
			{
				this._skeletonParts[name] = new Sprite( skeletonPartDefinition );
			}
			
			this._skeletonParts[name].visible = false;
			
			this.addChild( this._skeletonParts[name] );
		}*/
		
		this._addAccessor( 
			'skeletonDefinition', 
			function(){ return this._skeletonDefinition; }, 
			function(value)
			{
				if( value != this._skeletonDefinition )
				{
					this._skeletonDefinition = value;
				}
			}
		);
	}
	
	this.get_numFrames = function(){
		if( this.skeletonDefinition ){
			return this.skeletonDefinition.length;
		}
		
		return 0;
	}
	
	this.update = function(frameTime)
	{
		var skeletonDefinition = this.skeletonDefinition;
		
		if(!skeletonDefinition){
			return;//do nothing!
		}
		
		this._elapsedTime += frameTime * this.speed;
		var numFrames = skeletonDefinition.length, fps = this.fps;
		var playbackTime = numFrames / fps;
		
		var frameIndex = this._elapsedTime % playbackTime;
		
		if( frameIndex < 0 )
		{
			frameIndex += numFrames;
		}
		
		frameIndex = Math.floor( frameIndex * fps );
		
		var skeletonFrameData = skeletonDefinition.getFrameData( frameIndex ),
			currentChild,
			i,
			l,
			d = 0,
			part;
		
		for( i = 0, l = skeletonFrameData.length, part; i < l; i++ )
		{
			
			part = skeletonFrameData[i];
			currentChild = this._skeletonParts[part.name];
			
			if( currentChild )
			{
				currentChild.visible = true;
				
				this.swapChildren( currentChild, this.getChildAt( d++ ) );
				
				//now position child
				currentChild.x = part.x;
				currentChild.y = part.y;
				currentChild.scaleX = part.scaleX;
				currentChild.scaleY = part.scaleY;
				currentChild.rotation = part.rotation;
				currentChild.alpha = part.alpha; 
			}
		}
		
		for( l = this.numChildren; d < l; d++ )
		{
			this.getChildAt( d ).visible = false;
		}
	}
}