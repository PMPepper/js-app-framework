//#import com.asliceofcrazypie.fw.input.Input
//#import com.asliceofcrazypie.fw.input.InputDevice

/*
Defines an item
*/
//#class com.asliceofcrazypie.fw.input.MouseDevice extends com.asliceofcrazypie.fw.input.InputDevice
function( base )
{
	var $window = $(window);
	
	this.constructor = function( testObj ){
		base.constructor.call( this, 'mouse' );
		
		if( instance || testObj != _ )
		{
			throw new Error( 'Cannot create more than 1 mouse device. Get the keyboard with MouseDevice.instance' );
		}
		else
		{
			instance = this;
		}
		
		this._addReadOnly( 'type', 'mouse' );
		
		if( window )
		{
			this._isConnected = true;
			
			this._addInput( new Input( this.id+'-leftButton', 'leftButton', this ) );
			this._addInput( new Input( this.id+'-middleButton', 'middleButton', this ) );
			this._addInput( new Input( this.id+'-rightButton', 'rightButton', this ) );
			
			var updateButton = this._updateButton = ( function( e ){
				var button;
				var value = e.type == 'mousedown' ? 1 : 0;
				
				switch( e.which )
				{
					case 1:
						button = 'leftButton';
						break;
					case 2:
						button = 'middleButton';
						break;
					case 3:
						button = 'rightButton';
						break;
				}
				
				this._changes[button] = value;
			}.bind( this ) );
			
			window.addEventListener( 'mousedown', updateButton );
			window.addEventListener( 'mouseup', updateButton );
			
			//axes
			this._addInput( new Input( this.id+'-axisX', 'axisX', this ) );
			this._addInput( new Input( this.id+'-axisY', 'axisY', this ) );
			
			this._updateAxes = ( function( e )
			{
				if(this._clientX != e.clientX)
				{
					this._changes['axisX'] = this._clientX = e.clientX;
				}
				
				if(this._clientY != e.clientY)
				{
					this._changes['axisY'] = this._clientY = e.clientY;
				}
			}.bind( this ) );
			
			this._updatePageSize = ( function( e )
			{
				this.getInputByName( 'axisX' ).max = document.documentElement.clientWidth-1;
				this.getInputByName( 'axisY' ).max = document.documentElement.clientHeight-1;
			}.bind( this ) );
			
			window.addEventListener( 'mousemove', this._updateAxes );
			window.addEventListener( 'resize', this._updatePageSize );
			window.addEventListener( 'orientationchange', this._updatePageSize );
			
			this._updatePageSize();//init
			
			//TODO mousewheel
		}
		else
		{
			this._isConnected = false;
		}
		
		InputDevice._registerDevice( this );
	}
	
	this.dispose = function(){
		if( !this.__isDisposed )
		{
			isCreated = false;
			base.dispose.call( this );
			window.removeEventListener( 'mousedown', this._updateButton );
			window.removeEventListener( 'mouseup', this._updateButton );
			window.removeEventListener( 'mousemove', this._updateAxes );
			instance = null
		}
	}
	var instance;
	var _ = {};
	
	Object.defineProperty( Self, 'instance', { configurable:false, enumerable:false, get:function(){ return instance ? instance : ( instance = new Self( _ ) ); } } );
}