//#import com.asliceofcrazypie.fw.input.Input
//#import com.asliceofcrazypie.fw.input.InputDevice

/*
Defines an item
*/

//#class com.asliceofcrazypie.fw.input.GamepadDevice extends com.asliceofcrazypie.fw.input.InputDevice
function( base )
{
	var XINPUT_ID = 'XInput STANDARD GAMEPAD';
	var XINPUT_BUTTON_NAMES = ['A', 'B', 'X', 'Y', 'leftShoulder', 'rightShoulder', 'leftTrigger', 'rightTrigger', 'back', 'start', 'leftStick', 'rightStick', 'up', 'down', 'left', 'right'];
	var XINPUT_AXIS_NAMES = ['leftX', 'leftY', 'rightX', 'rightY'];
	
	var GENERIC_BUTTON_NAMES = ['A', 'B', 'X', 'Y', 'leftShoulder', 'rightShoulder', 'leftTrigger', 'rightTrigger', 'back', 'start', 'leftStick', 'rightStick', 'up', 'down', 'left', 'right'];
	var GENERIC_AXIS_NAMES = ['leftX', 'leftY', 'rightX', 'rightY'];
	
	//var GENERIC_BUTTON_NAMES = ['A', 'B', 'C', 'D', 'W', 'X', 'Y', 'Z', 'button9', 'button10', 'button11', 'button12', 'button13', 'button14', 'button15', 'button16', 'button17', 'button18', 'button19', 'button20' ];
	//var GENERIC_AXIS_NAMES = ['leftY', 'leftX', 'rightY', 'rightX'];
	
	this.constructor = function( testObj, gamepad ){
		if( testObj != _ )
		{
			throw new Error( 'You may not directly instanciate a gamepad' );
		}
		
		base.constructor.call( this, 'gamepad'+gamepad.index );
		this._addReadOnly( 'name', gamepad.id );
		this._addReadOnly( 'index', gamepad.index );
		this._addReadOnly( 'type', 'gamepad' );
		this._isConnected = false;
		
		this._timestamp = -1;
		
		this._buttonInputs = [];
		this._axisInputs = [];
		
		//init inputs
		var i, name, input;
		
		if( gamepad.id.indexOf( XINPUT_ID ) )
		{
			for( i = 0; i < gamepad.buttons.length; i++ )
			{
				name = XINPUT_BUTTON_NAMES[i];
				input = new Input( this.id+name, name, this );
				this._addInput( input );
				this._buttonInputs[i] = input;
			}
			
			for( i = 0; i < gamepad.axes.length; i++ )
			{
				name = XINPUT_AXIS_NAMES[i];
				input = new Input( this.id+name, name, this );
				input.max = 1;
				input.min = -1;
				input.inverted = true;
				input.deadzone = 0.2;
				this._addInput( input );
				this._axisInputs[i] = input;
			}
		}
		else//generic controllers
		{
			for( i = 0; i < gamepad.buttons.length; i++ )
			{
				name = GENERIC_BUTTON_NAMES[i] || 'button'+i;
				input = new Input( this.id+name, name, this );
				this._addInput( input );
				this._buttonInputs[i] = input;
			}
			
			for( i = 0; i < gamepad.axes.length; i++ )
			{
				name = GENERIC_AXIS_NAMES[i] || 'axis'+i;
				input = new Input( this.id+name, name, this );
				input.max = 1;
				input.min = -1;
				input.deadzone = 0.25;
				this._addInput( input );
				this._axisInputs[i] = input;
			}
		}
		
		InputDevice._registerDevice( this );
        
		this.update();
		
	}
	
	this.update = function()
	{
		var gamepad = gamepads[this.index];
		
		this.changed.length = 0;
		
		if( gamepad )
		{
			if( !this._isConnected )
			{
				this._isConnected = true;
				this.dispatchEvent( {type:InputDevice.CONNECTED, device:this} );
			}
			
			if( gamepad.timestamp && gamepad.timestamp > this._timestamp )
			{
				//update
				this._timestamp = gamepad.timestamp;
				
				var i;
				
				for( i = this._buttonInputs.length-1; i > -1; --i )
				{
					if( this._buttonInputs[i].update( gamepad.buttons[i] ) )
					{
						this.changed.push( this._buttonInputs[i] );
					}
				}
				for( i = this._axisInputs.length-1; i > -1; --i )
				{
					if( this._axisInputs[i].update( gamepad.axes[i] ) )
					{
						this.changed.push( this._axisInputs[i] );
					}
				}
				
				this.dispatchEvent( {type:InputDevice.CHANGED, device:this } );
				
				return true;
			}
		}
		else if( this._isConnected )
		{
			this._isConnected = false;
			this.dispatchEvent({type:InputDevice.DISCONNECTED, device:this} );
		}
		
		return false;
	}
	
	var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads || !!navigator.getGamepads || !!navigator.msGetGamepads || !! navigator.oGetGamepads || !!navigator.mozGetGamepads;
	
	var gamepadDevices = {};//gamepad devices (key is index)
	var gamepads;//raw gamepad data from browser (an array)
	
	if( gamepadSupportAvailable )
	{
		var _ = {};
		
		//normalise retrieving gamepads
		if( !navigator.getGamepads )
		{
			if( navigator.webkitGamepads )
			{
				navigator.getGamepads = function(){
					return navigator.webkitGamepads;
				}
			}
			else
			{
				navigator.getGamepads = navigator.webkitGetGamepads || navigator.msGetGamepads || navigator.oGetGamepads || navigator.mozGetGamepads;
			}
		}
	}
	
	Self._pollGamepads = function(){
		if( gamepadSupportAvailable )
		{
			gamepads = navigator.getGamepads();
			
			//look for newly connected gamepads
			if( gamepads && gamepads.length > 0 )
			{
				var gamepad;
				
				for( var i = 0; i < gamepads.length; i++ )
				{
					gamepad = gamepads[i];
					
					if( gamepad && !gamepadDevices[gamepad.index] )
					{
						gamepadDevices[gamepad.index] = new Self( _, gamepad );
					}
				}
			}
		}
		//check for disconnected gamepads
		/*for( var s in gamepadDevices )
		{
			if( updatedGamepads.indexOf( gamepadDevices[s].index ) == -1 )
			{
				//debugger;
				gamepadDevices[s].update( null );
			}
		}
		
		updatedGamepads.length = 0;*/
	}
	
	Self.getConnectedDevices = function()
	{
		var devices = [], device;
		
		for( var s in gamepadDevices )
		{
			device = gamepadDevices[s];
			
			if( device && device.isConnected )
			{
				devices.push( device );
			}
		}
		
		return devices;
	}
}