//#import com.asliceofcrazypie.fw.EventDispatcher
//#import com.asliceofcrazypie.fw.input.InputDevice
//#import com.asliceofcrazypie.fw.util.NumberUtil
//#uses com.asliceofcrazypie.fw.input.ControlMode

/*
Manages complex controls for games
*/

//TODO trigger event when controlMode getSelection some devices?
//TODO actually switch control mode when a mode no longer has any devices?
//
//TODO keep track of changed inputs, etc? not certain this is required
//TODO can probably optimise this code significantly, button only as a percentage..
//TODO allow controls to be changed/remapped

//#class com.asliceofcrazypie.fw.input.Controls extends com.asliceofcrazypie.fw.EventDispatcher
function( base )
{
	this.constructor = function( controls ){
		base.constructor.call( this );
		
		this._modes = {};
		this._activeMode = null;
		
		this.mapControls( controls );
	}
	
	Self.MODE_CHANGED = 'modechanged';
	Self.CHANGED = 'changed';
	Self.MODE_DISCONNECTED = 'modedisconnected';
    
	
	this.mapControls = function( controls )
	{
		var mode;
		
		//clear current controls
		for( mode in this._modes )
		{
			this._modes[mode].dispose();
			delete this._modes[mode];
		}
        
        this._defaultMode = controls.defaultMode;
		
		if( controls.modes )
		{
			for( var mode in controls.modes )
			{
				this._addMode( mode, controls.modes[mode] );
			}
			
			if( controls.defaultMode )
			{
				this.setActiveMode( this._modes[controls.defaultMode] );
			}
			else
			{
				//just pick an available mode
				this.deactivateActiveMode();
			}
		}
		else
		{
			this._addMode( 'default', controls );
			
			this.setActiveMode( this._modes['default'] );
		}
		
		
	}
	
	this._addMode = function( name, mode ){
        if( !ControlMode ){
            ControlMode = ACPF.getClassByQualifiedName( 'com.asliceofcrazypie.fw.input.ControlMode' );
        }
        
		this._modes[name] = new ControlMode( name, this, mode );
        
        this._modes[name].addEventListener( ControlMode.MODE_HAS_NO_ACTIVE_DEVICES, this._modeHasNoActiveDevices.bind( this ) );
        this._modes[name].addEventListener( ControlMode.MODE_HAS_ACTIVE_DEVICES, this._modeHasActiveDevices.bind( this ) );
	}
	
	this.setActiveMode = function( controlMode )
	{
		if( this._activeMode != controlMode )
		{
			var oldMode = null, newMode = null;
			
			if( this._activeMode )
			{
				oldMode = this._activeMode.name;
				this._activeMode.setActive( false );
			}
			
			this._activeMode = controlMode;
			
			if( controlMode )
			{
				newMode = this._activeMode.name;
				controlMode.setActive( true );
                
			}
			
			this._lastActiveMode = oldMode;
            
            if( controlMode && !controlMode.hasConnectedDevices() ){
                this.deactivateActiveMode();
                return;
            }
			
			this.dispatchEvent( {type:Self.MODE_CHANGED, oldMode:oldMode, newMode:newMode} );
		}
	}
	
	this.deactivateActiveMode = function()
	{
		if( this._lastActiveMode && this._lastActiveMode.hasConnectedDevices() )//use last active mode?
		{
			this.setActiveMode( this._lastActiveMode );
				
			return;
		}
		
		//otherwise find any available mode
		for( var modeName in this._modes )
		{
			if( this._modes[modeName].hasConnectedDevices() )
			{
				//make this mode the active mode
				this.setActiveMode( this._modes[modeName] );
				
				return;
			}
		}
	}
	
	this._modeHasActiveDevices = function( event )
	{
        /*var mode = event.target;
        
        console.log( '_modeHasActiveDevices', event, this );
        
        //if there is no currently active mode
        if( !this._activeMode ){
            this.setActiveMode( mode );//switch to this mode
        }*/
	}
    
	this._modeHasNoActiveDevices = function( event )
	{
        /*var mode = event.target;
        
        console.log( '_modeHasNoActiveDevices', event );
        
        if( mode == this._activeMode ){
            this.deactivateActiveMode();
        }*/
	}
	
	this.activeModeChanged = function(){
		this.dispatchEvent( {type:Self.CHANGED } );
	}
	
	this.getInputByName = function( name ){
		return this._activeMode ? this._activeMode.getInputByName( name ) : null ;
	}
	
	this.getActiveModeName = function(){
		if( this._activeMode )
		{
			return this._activeMode.name;
		}
		
		return null;
	}
	
	this.dispose = function()
	{
		if( !this.__isDisposed )
		{
			//clear listeners
			this._connectedListener.remove();
			this._disconnectedListener.remove();
			
			this._connectedListener = this._disconnectedListener = null;
			
			//remove ControlMode modes
			for( var mode in this._modes )
			{
				this._modes[mode].dispose();
				delete this._modes[mode];
			}
			
			//super
			base.dispose.call( this );
		}
	}
	
	function isDevice( match, device ){
		if( typeof( match ) == 'string' )
		{
			return match == '*' || device.id == match;
		}
		else if( match instanceof RegExp )
		{
			return match.test( device.id );
		}
		
		return match === device;
	}
    
    Self.isDevice = isDevice;
    
    var ControlMode;
    
}