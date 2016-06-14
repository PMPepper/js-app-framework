//#import com.asliceofcrazypie.fw.input.Input
//#import com.asliceofcrazypie.fw.input.InputDevice

/*
Defines an item
*/

//#class com.asliceofcrazypie.fw.input.KeyboardDevice extends com.asliceofcrazypie.fw.input.InputDevice
function( base )
{
	keycodes = {
		0: "\\",
		8: "backspace",
		9: "tab",
		12: "num",
		13: "enter",
		16: "shift",
		17: "ctrl",
		18: "alt",
		19: "pause",
		20: "caps",
		27: "esc",
		32: "space",
		33: "pageup",
		34: "pagedown",
		35: "end",
		36: "home",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		44: "print",
		45: "insert",
		46: "delete",
		48: "0",
		49: "1",
		50: "2",
		51: "3",
		52: "4",
		53: "5",
		54: "6",
		55: "7",
		56: "8",
		57: "9",
		65: "a",
		66: "b",
		67: "c",
		68: "d",
		69: "e",
		70: "f",
		71: "g",
		72: "h",
		73: "i",
		74: "j",
		75: "k",
		76: "l",
		77: "m",
		78: "n",
		79: "o",
		80: "p",
		81: "q",
		82: "r",
		83: "s",
		84: "t",
		85: "u",
		86: "v",
		87: "w",
		88: "x",
		89: "y",
		90: "z",
		91: "cmd",
		92: "cmd",
		93: "cmd",
		96: "num_0",
		97: "num_1",
		98: "num_2",
		99: "num_3",
		100: "num_4",
		101: "num_5",
		102: "num_6",
		103: "num_7",
		104: "num_8",
		105: "num_9",
		106: "num_multiply",
		107: "num_add",
		108: "num_enter",
		109: "num_subtract",
		110: "num_decimal",
		111: "num_divide",
		124: "print",
		144: "num",
		145: "scroll",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: "\\",
		221: "]",
		222: "\'",
		223: "`",
		224: "cmd",
		57392: "ctrl",
		63289: "num"
	};
	
	if (navigator && navigator.userAgent.indexOf("Opera") !== -1) {
      keycodes["17"] = "cmd";
    }
	
	this.constructor = function( testObj ){
		base.constructor.call( this, 'keyboard' );
		
		if( instance || testObj != _ )
		{
			throw new Error( 'Cannot create more than 1 keyboard device. Get the keyboard with KeyboardDevice.instance' );
		}
		else
		{
			instance = this;
		}
		
		this._addReadOnly( 'type', 'keyboard' );
		
		if( window )
		{
			this._isConnected = true;
			
			var name;
			
			for( var keycode in keycodes )
			{
				name = keycodes[keycode];
				
				this._addInput( new Input( this.id+'-'+name, name, this ) );
			}
			
			var update = this._update = ( function( e ){
				var keycode = e.keyCode;
				var value = e.type == 'keydown' ? 1 : 0;
				
				this._changes[keycodes[keycode]] = value;
			}.bind( this ) );
			
			window.addEventListener( 'keydown', update );
			window.addEventListener( 'keyup', update );
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
			InputDevice._unregisterDevice( this );
			base.dispose.call( this );
			window.removeEventListener( 'keydown', this._update );
			window.removeEventListener( 'keyup', this._update );
			instance = null;
		}
	}
	
	var instance;
	var _ = {};
	
	Object.defineProperty( Self, 'instance', { configurable:false, enumerable:false, get:function(){ return instance ? instance : ( instance = new Self( _ ) ); } } );
}