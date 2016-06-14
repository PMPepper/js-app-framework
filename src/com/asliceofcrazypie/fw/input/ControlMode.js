//#import com.asliceofcrazypie.fw.EventDispatcher
//#import com.asliceofcrazypie.fw.input.InputDevice
//#import com.asliceofcrazypie.fw.input.Controls
//#import com.asliceofcrazypie.fw.input.ControlInput


//#class com.asliceofcrazypie.fw.input.ControlMode extends com.asliceofcrazypie.fw.EventDispatcher
function( base ){
    //ControlMode modes
	this.constructor = function( name, control, definition ){
        base.constructor.call( this );
        
		//init vars
		this.name = name;
		this.control = control;
		this.definition = definition;
		
		this.devices = [];
		this.deviceListeners = [];
		this.inputs = {};
		
		this._isChanged = false;
		this._isActive = false;
		
		//listen for changes to devices connection state
		this._connectedListener = InputDevice.addEventListener( InputDevice.CONNECTED, ( this._onDeviceConnected ).bind( this ) );
		this._disconnectedListener = InputDevice.addEventListener( InputDevice.DISCONNECTED, ( this._onDeviceDisconnected ).bind( this ) );
		
		//init devices
		var connectedDevices = InputDevice.getConnectedDevices();
		
		if( !definition.devices ){
			definition.devices = [];
		}
		
		definition.devices.forEach( function( match ){
			connectedDevices.forEach( function( device ){
				if( Controls.isDevice( match, device ) )
				{
					this.addDevice( device );
				}
			}, this );
		}, this);
		
		//now init inputs
		if( !definition.inputs ){
			definition.inputs = {};
		}
		
		for( var name in definition.inputs )
		{
			this.inputs[name] = new ControlInput( this, name, definition.inputs[name] );
		}
		
		//finally, call once inputs and devices inited (suppressEvents changed events during initialisation)
		this._updateInputDevices( true );
	}
    
    //
    Self.MODE_HAS_NO_ACTIVE_DEVICES = 'modeHasNoActiveDevices';
    Self.MODE_HAS_ACTIVE_DEVICES = 'modeHasActiveDevices';
	
	//event handlers
	this._onDeviceConnected = function(evt){
		
		if( evt.device && !this.hasDevice( evt.device ) )//this mode does not currently have this device
		{
			var isAdded = false;
			
			this.definition.devices.forEach( function( match ){
				if( !isAdded && Controls.isDevice( match, evt.device ) )//this device matches the definition
				{
					this.addDevice( evt.device );
					isAdded = true;
				}
			}, this);
		}
	}
	
	this._onDeviceDisconnected = function(evt){
		if( evt.device && this.hasDevice( evt.device ) )
		{
			this.removeDevice( evt.device );
		}
	}
	
	this._onDeviceChanged = function( evt, suppressEvents ){
		var inputs = this.inputs,
			input;
		
		this._isChanged = !!suppressEvents;
		
		for( var name in inputs )
		{
			inputs[name].update();
		}
	}
	
	//called when devices added/removed
	this._updateInputDevices = function( supressEvents ){
		this._onDeviceChanged( null, supressEvents );
	}
	
	//public methods
	//-used by the Control to set this mode as active
	this.setActive = function( isActive )
	{
		if( this._isActive != isActive )
		{
			this._isActive = isActive;
		}
	}
	
	//-inputs
	this.getInputByName = function( name ){
		return this.inputs[name];
	}
	
	//--called by input when it changes
	this.isChanged = function(){
		//if( !this._isChanged )
		//{
			if( !this._isActive )
			{
				this.control.setActiveMode( this );
			}
			
			this.control.activeModeChanged();
			
			this._isChanged = true;
		//}
	}
	
	//--returns if this is active
	this.isActive = function(){
		return this._isActive;
	}
	
	//-devices
	this.hasDevice = function(device){
		return this.devices.indexOf( device ) != -1;
	}
	
	this.hasConnectedDevices = function(){
		return this.devices.length > 0;
	}
	
	this.addDevice = function(device){
		if( !this.hasDevice( device ) )
		{
            var initDevicesLength = this.devices.length;
			this.devices.push( device );
			this.deviceListeners.push( device.addEventListener( InputDevice.CHANGED, this._onDeviceChanged.bind( this ) ) );
			this._updateInputDevices();
            
            if( initDevicesLength === 0 ){
                this.dispatchEvent( Self.MODE_HAS_ACTIVE_DEVICES );
            }
		}
	}
	
	this.removeDevice = function(device){
		if( this.hasDevice( device ) )
		{
			var index = this.devices.indexOf( device );
			
			device.removeEventListener( this.deviceListeners[index] );
			
			this.devices.splice( index, 1 );
			this.deviceListeners.splice( index, 1 );
			this._updateInputDevices();
            
            
            if( this.devices.length === 0 ){
                this.dispatchEvent( Self.MODE_HAS_NO_ACTIVE_DEVICES );
            }
		}
	}
	
	//-misc
	this.dispose = function(){
		this.name = this.definition = null;
		
		//remove all devices
		for( var i = this.devices.length-1; i > -1; --i )
		{
			this.removeDevice( this.devices[i] );
		}
		
		this.devices.length = 0;
		this.devices = null;
	}
}