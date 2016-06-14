//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.graphics.SkeletonDefinition extends com.asliceofcrazypie.fw.Base
function( base )
{
	this.constructor = function( frameRate, data ){
		base.constructor.call( this );
		
		this._frameRate;
		this._data = data;
		
		this._addAccessor( 'length', function(){ return this._data.length } );
		this._addAccessor( 'frameRate', function(){ return this._frameRate; } );
	}
	
	this.getFrameData = function( index )
	{
		return this._data[index];
	}
	
	
	Self.fromObj = function( obj ){
		var frameRate = parseFloat( obj['fps'] );
		var frames = obj['frames'];
		var parts = obj['parts'];
		
		var lastParts = []
		var partsIndex = [];
		var data = [];
		
		for( var name in parts )
		{
			lastParts[parts[name]] = false;//initially record that each part wasn't there
			partsIndex[parts[name]] = name;
		}
		
		//normalise data
		for( var i = 0, j, frame, currentPart; i < frames.length; i++ )
		{
			frame = data[i] = [];
			
			for( j = 0; j < frames[i].length; j++ )
			{
				currentPart = frames[i][j];
				
				if( !currentPart )//if set to null, has not changed since last frame
				{
					currentPart = lastParts[j];
				}
				else
				{
					$.extend( {}, frames[i][j] );//clone current part
					currentPart.name = partsIndex[currentPart.i];
					currentPart.alpha = typeof( currentPart.alpha ) == 'undefined' ? 1 : currentPart.alpha;//default to 1 if not set
					delete currentPart.i;
				}
				
				//record 
				frame[j] = currentPart;
				
				//record what the current value of this part is for next frame
				lastParts[j] = frame[j];
			}
		}
		
		return new Self( frameRate, data );
	}
}