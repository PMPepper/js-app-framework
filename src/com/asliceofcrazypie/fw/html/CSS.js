//#import com.asliceofcrazypie.fw.Core
//#import com.asliceofcrazypie.fw.util.StringUtil

//#class com.asliceofcrazypie.fw.html.CSS
function(){
	Object.defineProperty( 
		this, 
		'Prefixes', 
		{
			value:['','webkit','ms', 'o', 'moz'], 
			configurable:false, 
			enumerable:false,
			writable:false 
		} 
	);
	
	Object.freeze( this.Prefixes );
	
	
	this.parseSelector = function( selector ){
		selector = StringUtil.trim( selector );//.replace( /\s+/, ' ' );
		
		var i, selectors = [], chr, parseMode, selectorPartStr, rules = [], parseMode, curPart, curTag, curId, curAttrKey, curAttrVal, curAttrMode, curClass,
			curClasses = [], curAttrs = [], attrPart='key', curPsuedo, curRelationship;
		
		//function 
		function endSelector(){
			endRule();
			
			if( rules.length > 0 )
			{
				selectors.push( rules );
				rules = [];
			}
		}
		
		function endRule(){
			endPart();
			
			if( curTag || curId || curClasses.length > 0 || curAttrs.length || curPsuedo )
			{
				rules.push({ tag:curTag, id:curId, classes:curClasses, attributes:curAttrs, psuedo:curPsuedo, relationship:curRelationship })
			}
			
			curPart = 'tag';//assume starting with tag
			parseMode = 'start';
			curTag = '';
			curId = ''
			curAttrKey = '';
			curAttrVal = '';
			curAttrMode = '';
			attrPart = 'key';
			curClass = '';
			curClasses = [];
			curAttrs = [];
			curPsuedo = '';
			curRelationship = '';
		}
		
		function startPart( part ){
			endPart();
			if( parseMode == 'start' )
			{
				parseMode = 'standard';
			}
			curPart = part;
		}
		
		function addPart( chr )
		{
			if( parseMode == 'start' )
			{
				parseMode = 'standard';
			}
			
			switch( curPart )
			{
				case 'tag':
					curTag += chr;
					break;
				case 'id':
					curId += chr;
					break;
				case 'class':
					curClass += chr;
					break;
				case 'attribute':
					if( parseMode == 'standard' && chr == ']' )
					{
						endPart();
					}
					else if( parseMode == 'standard' && chr == '=' ){
						if( attrPart == 'key' )
						{
							attrPart = 'value';
							
							switch( selector.charAt( i-1 ) ){
								case '*'://attribute contains vaule somewhere
									curAttrMode = '*=';
									break;
								case '^'://attribute begins with value
									curAttrMode = '^=';
									break;
								case '$'://attribute ends with certain value
									curAttrMode = '$=';
									break;
								case '~'://attribute is within space separated list
									curAttrMode = '~=';
									break;
								case '|'://attribute is withing dash separated list
									curAttrMode = '|=';
									break;
								default:
									curAttrMode = '=';
									return;//stop executing
							}
							
							curAttrKey = curAttrKey.substr( 0, curAttrKey.length-1 );
						}
						else
						{
							throw new Error( 'invalid selector, found "=" in illegal position at position '+i+' of '+selector );
						}
					}
					else
					{
						//TODO lots more logic here...
						if( attrPart == 'key' )
						{
							curAttrKey += chr;
						}
						else
						{
							if( chr == '"' )
							{
								if( parseMode == 'standard' )
								{
									//special
									if( curAttrVal == '' )
									{
										parseMode = 'quoted-attr';
									}
									else
									{
										throw new Error( 'invalid selector, found \'"\'in illegal position at position '+i+' of '+selector );
									}
								}
								else
								{
									parseMode = 'standard';
								}
							}
							else
							{
								curAttrVal += chr;
							}
						}
					}
					break;
				case 'psuedo':
					//TODO handle quotes values??
					if( chr != ':' )
					{
						curPsuedo += chr;
					}
					break;
			}
		}
		
		function endPart()
		{
			switch( curPart )
			{
				case 'tag':
				case 'id':
				case 'psuedo':
					break;
				case 'class':
					curClasses.push( curClass );
					curClass = '';
					break;
				case 'psuedo':
					break;
				case 'attribute':
					curAttrs.push( {key:curAttrKey, value:curAttrVal, mode:curAttrMode} );
					curAttrKey = curAttrVal = curAttrMode = '';
					attrPart = 'key';
					break;
			}
			
			curPart = '';//no part
			parseMode = 'start';
		}
		
		endRule();//init vars
		
		for( i = 0, l = selector.length; i < l; i++ )
		{
			chr = selector.charAt( i );
			
			switch( parseMode )
			{
				case 'start':
					if( chr == '>' || chr == '+' || chr == '~' )//child
					{
						//debugger;
						curRelationship = chr;
						//parseMode = 'standard';
						break;
					}
				case 'standard':
					switch( chr )
					{
						case '.'://class
							startPart( 'class' );
							break;
						case '#'://id
							startPart( 'id' );
							break;
						case ':'://psuedo
							startPart( 'psuedo' );
							break;
						case '['://attribute
							startPart( 'attribute' );
							break;
						case ' ':
						case "\t":
						case "\r":
						case "\n":
							if(parseMode != 'start' ){
								endRule();
							}
							break;
						case ',':
							endSelector();
							break;
						default:
							addPart( chr );
					}
					break;
					
				case 'quoted-attr':
					addPart( chr );
					break;
			}
		}
		
		endSelector();
		
		return selectors;
	}
	
	this.getPropName = function( prop ) {
        var vendorProp, supportedProp,
            capProp = $.map( prop.split( '-' ), function( value ){ return value.charAt( 0 ).toUpperCase() + prop.slice( 1 ) } ).join( '' ),//prop.charAt( 0 ).toUpperCase() + prop.slice( 1 ),
            div = document.createElement( "div" ),
            prefixes = this.Prefixes;
        
        if ( prop in div.style ) {
            supportedProp = prop;
        }
        else
        {
            for ( var i = 0; i < prefixes.length; i++ ) {
                vendorProp = prefixes[ i ] + capProp;
                if ( vendorProp in div.style ) {
                    supportedProp = '-'+prefixes[ i ]+'-'+prop//vendorProp;
                    break;
                }
            }
        }
        div = null;
        $.support[ prop ] = supportedProp;
        return supportedProp || false;
    }
	
	//init code
	//-add transform and transition to jquery and normalize prefixes
	var props = ['transform', 'transition'],
        propName;
    
    for( var i = props.length-1; i > -1; --i )
    {
        propName = this.getPropName( props[i] );
		
        if( propName && propName != props[i] )//need to add support
        {
            $.cssHooks[propName] = {
                get:function( elem, computed, extra ){
                    return $.css( elem, this.propName );
                },
                set:function( elem, value ){
                    elem.style[ this.propName ] = value;
                },
                propName:propName
            }
        }
    }
}