//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.EventDispatcher extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( target ){
		base.constructor.call( this );
		
		if( !target )
		{
			target = this;
		}
		
		this._addReadOnly( '_target', target );
		this._addReadOnly( '_listeners', {} );
		this._addReadOnly( '_autoTriggers', {} );
	}
	
	//When an listener of type 'event' is added, call test method. If it returns NOT false, call the listener with the supplied value
	this._autoTrigger = function( event, testMethod ){
		if( event && ( testMethod instanceof Function ) )
		{
			this._autoTriggers[event] = testMethod;
		}
	}
	
	this.dispose = function(){
		if( !this.__isDisposed )
		{
			for( var s in this._listeners )
			{
				this._listeners[s].length = 0;
				delete this._listeners[s];
				delete this['on'+s];
			}
			
			//this._listeners[s] = null;
			
			base.dispose.call( this );
		}
	}
	
	this.addEventListener = function( event, handler ){
		if( typeof( handler ) != 'function' )
		{
			throw new Error( 'handler must be a function' );
		}
		
		if( typeof( event ) != 'string' )
		{
			throw new Error( 'event must be a string' );
		}
		
		var autoTriggerReturn;
		
		if( !this._listeners[event] )
		{
			this._listeners[event] = [];
		}
		
		var listener = new Listener( this, event, handler );
		
		this._listeners[event].push( listener );
		
		if( this._autoTriggers[event] )
		{
			autoTriggerReturn = this._autoTriggers[event]( event );
			
			if( autoTriggerReturn !== false )
			{
				setTimeout( function(){//decouple execution to prevent race conditions
					handler( autoTriggerReturn, listener );
				}, 10 );
			}
		}
		
		return listener;
	}
	
	this.removeEventListener = function(listener)
	{
		var listeners;
		
		if( arguments.length == 2 )
		{
			var event = arguments[0];
			var handler = arguments[1];
			
			listeners = this._listeners[event];
			listener = null;
			
			if( listeners && listeners.length > 0 )
			{
				for( var i = listeners.length-1; i > -1; --i )
				{
					if( listeners[i].event == event && listeners[i].handler == handler )
					{
						listener = listeners[i];
						break;
					}
				}
			}
			
			
		}
		
		if( !listener )
		{
			throw new Error( 'invalid listener' );
		}
		
		//find listener index
		listeners = this._listeners[listener.event];
		
		if( !listeners || listeners.length == 0 )
		{
			throw new Error( 'invalid listener' );
		}
		
		var listenerIndex = listeners.indexOf( listener );
		
		if( listenerIndex == -1 )
		{
			throw new Error( 'invalid listener' );
		}
		
		listeners.splice( listenerIndex, 1 );
	}
	
	this.dispatchEvent = function(event){
		if( typeof( event ) == 'string' )
		{
			event = {type:event};
		}
		
		event.target = event.target || this._target;
		event.currentTarget = this;
		
		var listeners = this._listeners[event.type];
		
		if( listeners && listeners.length > 0 )
		{
			for( var j = listeners.length-1; j > -1; --j )
			{
				listeners[j].handler( event, listeners[j] );
			}
		}
		
		if( this['on'+event.type] instanceof Function )
		{
			this['on'+event.type]( event );
		}
	}
	
	function Listener( dispatcher, event, handler )
	{
		this.event = event;
		this.handler = handler;
		
		var isRemoved = false;
		
		this.remove = function(){
			if( !isRemoved )
			{
				try
				{
					dispatcher.removeEventListener( this );
				}
				catch(e){}//suppress error
			}
		}
		
		Object.freeze( this );
	}
	
}