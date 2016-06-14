//#import com.asliceofcrazypie.fw.EventDispatcher

//#uses com.asliceofcrazypie.fw.input.KeyboardDevice
//#uses com.asliceofcrazypie.fw.input.MouseDevice
//#uses com.asliceofcrazypie.fw.input.GamepadDevice

/*
An abstract input device
*/

//#class com.asliceofcrazypie.fw.input.InputDevice extends com.asliceofcrazypie.fw.EventDispatcher
function( base )
{
	//id is unique name for this input device
	this.constructor = function( id ){
		base.constructor.call( this );
		
		this._addReadOnly( 'id', id );
		this.type = null;
		
		this._inputs = {};
		this._isConnected = false;
		
		this._changes = {};
		this._hadFocus = false;
		this.changed = [];
		
		this._addAccessor( 'isConnected', function(){ return this._isConnected; } );
	}
	
	//internal methods
	this._addInput = function( input ){
		if( input.device == this )
		{
			this._inputs[input.name] = input;
		}
	}
	
	//public methods
	this.update = function(){
		if( document && !document.hasFocus() )
		{
			
			for( var name in this._changes )
			{
				delete this._changes[name];
			}
			
			this.changed.length = 0;
			
			if( this._hadFocus )
			{
				this.forEachInput( function( input ){
					input.update( input.min );//reset all values
				} );
				this._hadFocus = false;
				
				
			}
		}
		else
		{
			this._hadFocus = true;
			this.changed.length = 0;
			
			for( var name in this._inputs )
			{
				var input = this._inputs[name];
				
				if( input.update( this._changes[name] ) )
				{
					this.changed.push( input );
				}
				
				delete this._changes[name];
			}
			/*
			for( var name in this._changes )
			{
				var input = this.getInputByName( name );
				
				if( input )
				{
					input.update( this._changes[name] );
					this.changed.push( input );
				}
				
				delete this._changes[name];
			}
			*/
			if( this.changed.length > 0 )
			{
				this.dispatchEvent( {type:Self.CHANGED, device:this } );
				
				return true;
			}
			
			
		}
		return false;
	}
	
	this.forEachInput = function( callback ){
		for( var s in this._inputs )
		{
			callback( this._inputs[s] );
		}
	}
	
	this.getInputByName = function( name ){
		return this._inputs[name];
	}
	
	this.getInputById = function( id )
	{
		for( var s in this._inputs )
		{
			if( this._inputs[s].id == id )
			{
				return this._inputs[s];
			}
		}
		
		return null;
	}
	
	this.dispose = function(){
		if( !this.__isDisposed )
		{
			base.dispose.call( this );
			
			this._changes = null;
			
			for( var s in this._inputs )
			{
				this._inputs[s].dispose();
				delete this._inputs[s];
			}
			
			this._inputs = null;
		}
	}
	
	//static methods
	
	Self.CONNECTED = 'connected';
	Self.DISCONNECTED = 'disconnected';
	Self.CHANGED = 'changed';
	
	var dispatcher = new EventDispatcher( Self );
	var devices = [];
	var deviceListener = {};
	var changedDevices = [];
	var lastChangedDevices = [];
	
	//get child classes once inited
	var GamePadDevice = null;
	var KeyboardDevice = null;
	var MouseDevice = null;
	window.requestAnimationFrame( function(){
		GamepadDevice = ACPF.getClassByQualifiedName( "com.asliceofcrazypie.fw.input.GamepadDevice" )
		KeyboardDevice = ACPF.getClassByQualifiedName( "com.asliceofcrazypie.fw.input.KeyboardDevice" )
		MouseDevice = ACPF.getClassByQualifiedName( "com.asliceofcrazypie.fw.input.MouseDevice" )
		
		if( MouseDevice && MouseDevice.instance && KeyboardDevice && KeyboardDevice.instance )
		{
			//inited devices
			var mouse = MouseDevice.instance;
			var keyboards = KeyboardDevice.instance;
			
			updateDevices();//start polling devices
		}
		else
		{
			window.requestAnimationFrame( arguments.callee );
		}
	});
	
	Self.addEventListener = function(){
		return dispatcher.addEventListener.apply( dispatcher, arguments );
	}
	Self.removeEventListener = function(){
		return dispatcher.removeEventListener.apply( dispatcher, arguments );
	}
	
	Self.getDeviceById = function( id ){
		for( var i = devices.length-1; i > -1; --i )
		{
			if( devices[i].id == id )
			{
				return devices[i];
			}
		}
		
		if( id == 'keyboard' )
		{
			return KeyboardDevice.instance
		}
		else if( id == 'mouse' )
		{
			return MouseDevice.instance
		}
		else if( id == 'gamepad' )
		{
			//TODO create a device that maps all gamepads
		}
		
		return null;
	}
	
	Self.getConnectedDevices = function(){
		var connected = [];
		
		for( var i = devices.length-1; i > -1; --i )
		{
			if( devices[i].isConnected )
			{
				connected.push( devices[i] )
			}
		}
		
		return connected;
	}
	
	Self.getChangedDevices = function(){
		return changedDevices;
	}
	
	//returns the most recently changed devices
	Self.getLastChangedDevices = function(){
		return lastChangedDevices;
	}
	
	Self._registerDevice = function( device ){
		devices.push(device);
		dispatcher.dispatchEvent( {type:Self.CONNECTED, device:device} );
		
		var connected = device.addEventListener( Self.CONNECTED, deviceConnectionChanged )
		var disconnected = device.addEventListener( Self.DISCONNECTED, deviceConnectionChanged )
		deviceListener[device.hash] = { connected:connected, disconnected:disconnected };
	}
	
	Self._unregisterDevice = function( device ){
		
		devices.splice(devices.indexOf( devices ), 1 );
		dispatcher.dispatchEvent( {type:Self.DISCONNECTED, device:device} );
		
		var listeners = deviceListener[device.hash];
		listeners.connected.remove();
		listeners.disconnected.remove();
		
		delete deviceListener[device.hash];
	}
	
	function deviceConnectionChanged( e )
	{
		dispatcher.dispatchEvent( { type:e.type, device:e.target } );
	}
	
	//keep updating devices
	function updateDevices(){
		GamepadDevice._pollGamepads();
		changedDevices.length = 0;
		
		for( var i = devices.length-1; i > -1; --i )
		{
			if( devices[i].update() )
			{
				changedDevices.push( devices[i] );
			}
		}
		
		if( changedDevices.length > 0 )
		{
			lastChangedDevices.length = 0;
			
			for( var i = 0; i < changedDevices.length; i++ )
			{
				lastChangedDevices[i] = changedDevices[i];
			}
		}
		
		//keep updating
		window.requestAnimationFrame( updateDevices );
	}
	
	
}