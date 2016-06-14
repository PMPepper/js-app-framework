//#import com.asliceofcrazypie.fw.Base

/*
An input object
Abstracts out mouse buttons, keyboard keys, joypad buttons
*/

//#class com.asliceofcrazypie.fw.input.Input extends com.asliceofcrazypie.fw.Base
function( base )
{
	//id is unique name for this input
	//name is the name of this input, unique per device
	this.constructor = function( id, name, device ){
		base.constructor.call( this );
		
		this._addReadOnly( 'id', id );
		this._addReadOnly( 'name', name );
		this._addReadOnly( 'device', device );
		
		this.min = 0;
		this.max = 1;
		this.value = 0;
		this.lastValue = 0;
		this.downThreshold = 0.5;
		this.raw = 0;
		this.deadZone = 0;
		this.inverted = false;
		
		this.isDown = this.isPressed = this.isReleased = this.isChanged = false;
		
		this._addAccessor( 'isConnected', function(){ return this.device ? this.device.isConnected : true; } );
	}
	
	this.update = function( newRawValue ){
		
		if( typeof( newRawValue ) !== 'undefined' )
		{
			if( this.deadzone != 0 )//TODO implement deadzone
			{
				if( newRawValue > -this.deadzone && newRawValue < this.deadzone )
				{
					newRawValue = 0;
				}
			}
			
			var value = ( newRawValue - this.min ) / ( this.max - this.min );
			
			if( value > 1 )
			{
				value = 1;
			}
			else if( value < 0 )
			{
				value = 0;
			}
			
			if( this.inverted )
			{
				value = 1-value;
			}
			
			var isDown = value >= this.downThreshold;
			
			if( isDown != this.isDown )
			{
				//state has changed
				this.isDown = isDown;
				
				//update change variables
				this.isPressed = isDown;
				this.isReleased = !isDown;
			}
			else
			{
				//state remains the same
				this.isPressed = this.isReleased = false;
			}
			
			var hasValueChanged = this.value != value;
			
			
			//record new value
			this.raw = newRawValue;
			this.lastValue = this.value;
			this.value = value;
			this.isChanged = hasValueChanged;
			
			return hasValueChanged;
		}
		
		//no change
		this.isChanged = this.isPressed = this.isReleased = false;
		
		return false;
	}
	
	this.dispose = function(){
		if( !this.__isDisposed )
		{
			base.dispose.call( this );
		}
	}
}