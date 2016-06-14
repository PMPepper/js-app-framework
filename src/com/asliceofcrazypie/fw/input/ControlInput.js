//#import com.asliceofcrazypie.fw.input.Controls

//#class com.asliceofcrazypie.fw.input.ControlInput extends com.asliceofcrazypie.Base
function( base ){
    //Inputs - normalises the input definition and stores the data.
	var defaultControlInputElementOptions = { lowest:false, changed:0, button:false };
	
	this.constructor = function ( controlMode, name, definition ){
		this.controlMode = controlMode
		this.name = name;
		this.value = 0;
		
		//normalise input definition
		var definitionInputs, options = null;
		
		if( typeof( definition ) == 'string' )
		{
			definitionInputs = definition;
			options = defaultControlInputElementOptions;
		}
		else
		{
			definitionInputs = definition.input;
			options = $.extend( {}, defaultControlInputElementOptions, definition.options );
		}
		
		if( !definitionInputs ){
			this.update = function(){}
			return;
		}
		
		this.definition = definitionInputs;
		this.options = options;
		
		var definitionElements = [''];
		var c;
		
		for( var i = 0; i < definitionInputs.length; i++ )
		{
			c = definitionInputs.charAt( i );
			
			switch( c )
			{
				case '&':
				case '|':
				case '(':
				case ')':
					definitionElements.push( '' );
					definitionElements[definitionElements.length-1] += c;
					definitionElements.push( '' );
					break;
				default:
					definitionElements[definitionElements.length-1] += c;
			}
		}
		
		var uniqueDefinitionElements = {};
		var self = this;
		
		function parseInputElement( str, inputOptions, button )
		{
			var parts = str.split( '_' );
			var input = parts.shift().split(':');
			
			var inputDevice = input.length > 1 ? input[0] : '*';
			var inputName = input.length > 1 ? input[1] : input[0];
			
			var options = {threshold:0.5, inverted:false, raw:false}, optionParts;
			
			for( var i = 0; i < parts.length; i++ )
			{
				optionParts = parts[i].split( ':' );
				
				options[optionParts[0]] = optionParts.length > 1 ? NumberUtil.tryParse( optionParts[1] ) : true;
			}
			
			var funcString;
			var comparisonOperator = inputOptions.lowest ? '<' : '>';
			
			
			if( button )
			{
				//returns true or false
				//examples:
				//rightTrigger_threshold:0.25
				//keyboard:up
				
				var threshold = parseFloat( options.threshold );
				
				funcString = 'function evalFunction(){'+
					'var devices = this.controlMode.devices;'+
					'var value = Number.NaN;'+
					
					'devices.forEach( function(device){'+"\n"+
					'	var input;'+"\n"+
						
					'	if( isDevice( inputDevice, device ) && ( input = device.getInputByName( inputName ) ) )'+"\n"+
					'	{'+"\n"+
					'		value = value '+comparisonOperator+' input.value ? value : input.value ;'+ "\n"+
					'	}'+"\n"+
					'} );'+"\n"+
					
					( ( options.inverted ) ? "\n"+'value *= -1;'+"\n" : '' )+
					
					'return value > '+threshold+';'+"\n"+
				'}';
			}
			else//axis
			{
				//returns the value of this input
				//examples:
				//rightY_inverted
				//leftX
				funcString = 'function evalFunction(){'+"\n"+
					'var devices = this.controlMode.devices;'+"\n"+
					'var value = Number.NaN;'+"\n"+
					
					'devices.forEach( function(device){'+"\n"+
					'	var input;'+"\n"+
						
					'	if( isDevice( inputDevice, device ) && ( input = device.getInputByName( inputName ) ) )'+"\n"+
					'	{'+"\n"+
					'		value = value '+comparisonOperator+' input.'+( options.raw ? 'raw' : 'value' )+' ? value : input.'+( options.raw ? 'raw' : 'value' )+' ;'+ "\n"+
					'	}'+"\n"+
					'} );'+"\n"+
					
					( ( options.inverted ) ? "\n"+'value *= -1;'+"\n" : '' )+
					
					'return value;'+"\n"+
				'}';
			}
			
			eval( funcString );
			
			return evalFunction.bind( self );
		}
		
		if( definitionElements.length == 1 && !options.button )
		{
			//will be treated as an axis
			this.test = parseInputElement( definitionInputs, options, false );
		}
		else
		{
			//more than 1 = Button mode
			definitionElements.forEach( function(definitionElement)
			{
				if( definitionElement != '' && definitionElement != '|' && definitionElement != '&' && definitionElement != '(' && definitionElement != ')' && !uniqueDefinitionElements[definitionElement] )
				{
					uniqueDefinitionElements[definitionElement] = parseInputElement( definitionElement, options, true );
				}
			} );
			
			for( var i = 0; i < definitionElements.length; i++ )
			{
				if( uniqueDefinitionElements[definitionElements[i]] )
				{
					definitionElements[i] = 'uniqueDefinitionElements["'+definitionElements[i]+'"]()';
				}
			}
			
			var checkStr = definitionElements.join( '' );
			
			checkStr = checkStr.replace( '|', ' || ' );
			checkStr = checkStr.replace( '&', ' && ' );
			
			var funcString = 'function tUpdate(){ '+'return '+checkStr +';}';
			
			eval( funcString );
			
			this.test = tUpdate;
		}
	}
	
	this.update = function(){
		var newValue = this.test();
		
        if( newValue != newValue ){
            newValue = 0;//protect against NaN
        }
        
		if( newValue != this.value )
		{
			if( newValue === true || newValue === false )
			{
				this.controlMode.isChanged();
			}
			else if( Math.abs( this.value - newValue ) > this.options.changed )
			{
				this.controlMode.isChanged();
			}
		}
        
        var oldValue = this.value;
        this.isPressed = !oldValue && newValue;
        this.isReleased = oldValue && !newValue;
        this.isChanged = oldValue != newValue;
        
        this.oldValue = oldValue;
        this.value = newValue;
        
        var self = this;
        
        window.requestAnimationFrame(function(){
            self.update();
        });
	}
	
	this.dispose = function(){
		this.name = this.inputs = null;
	}
    
    var isDevice = Controls.isDevice;
}