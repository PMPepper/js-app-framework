//#import com.asliceofcrazypie.fw.Core

//#class com.asliceofcrazypie.fw.util.StringUtil
function(){
	var whiteSpaceRegex = /^\s\s*/;
	var lineBreaksRegex = /(\r\n|[\n\v\f\r\x85\u2028\u2029])/;
	
	this.trim = function(str) {
		var	str = str.replace(whiteSpaceRegex, ''),
			ws = /\s/,
			i = str.length;
		while (ws.test(str.charAt(--i))){}
		return str.slice(0, i + 1);
	}
	
	this.splitWords = function( str )
	{
		return str.split( whiteSpaceRegex );
	}
	
	this.splitLines = function( str )
	{
		return str.split( lineBreaksRegex );
	}
	
	this.padLeft = function( str, padWith, length )
	{
		var i = 0;
		
		while( str.length < length )
		{
			str = padWith.charAt( i++ % padWith.length ) + str;
		}
		
		return str;
	}
	
	this.parseSimpleConfigStr = function( str ){
		var lines = this.splitLines( str );
		
		var config = {};
		
		lines.forEach( function( line ){
			line = this.trim( line );
			
			if( line )
			{
				var index = line.indexOf( ':' );
				
				if( index != -1 )
				{
					var key = this.trim( line.substr( 0, index ) );
					
					if( key )
					{
						var value = this.trim( line.substr( index+1 ) );
						var firstChar = value.charAt(0);
						var type = null;
						
						if( firstChar == '"' || firstChar == "'" )
						{
							if( value.charAt(value.length-1) == firstChar )
							{
								//force to be a string
								type = 'string';
								value = value.substr( 1, value.length-2 );
							}
						}
						
						if( !type )
						{
							if( value == 'true' )
							{
								type = 'boolean';
								value = true;
							}
							else if( value == 'false' )
							{
								type = 'boolean';
								value = false;
							}
							else if( value == 'null' )
							{
								type = 'null';
								value = null;
							}
							else
							{
								var num = parseFloat( value );
								
								if( num == num )
								{
									type = 'number';
									value = num;
								}
							}
						}
						
						config[key] = value;
					}
				}
				else
				{
					config[this.trim( line )] = null;
				}
			}
		}, this);
		
		return config;
	}
}