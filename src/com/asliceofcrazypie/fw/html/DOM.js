//#require libs.jquery-current

//#import com.asliceofcrazypie.fw.Core
//#import com.asliceofcrazypie.fw.util.StringUtil

//#class com.asliceofcrazypie.fw.html.DOM
function(){
	var self = this;
	
	Object.defineProperty( 
		this, 
		'Prefixes', 
		{
			value:['','Webkit','ms', 'O', 'Moz'], 
			configurable:false, 
			enumerable:false,
			writable:false 
		} 
	);
	
	Object.freeze( this.Prefixes );
	
	/*jQuery plugins*/
	$.fn.hash = function(){
		var hash = this.attr( 'data-hash' );
		
		if( !hash )
		{
			hash = 'x'+arguments.callee.id++;
			
			this.attr( 'data-hash', hash );
		}
		
		return hash
	}

	$.fn.findByHash = function( hash )
	{
		return this.find( '[data-hash="'+hash+'"]' );
	}

	$.fn.hash.id = 0;
	
	$.fn.classes = function(){
		if( this.length > 0 )
		{
			return this[0].className.split( /\s+/ );
		}
		
		return [];
	}
	
	this.elementFromSelector = function( selector, options )
	{
		options = $.extend( { defaultTag:'div', all:false }, options );
		var CSS = ACPF.getClassByQualifiedName( 'com.asliceofcrazypie.fw.html.CSS' );
		
		var selectors = CSS.parseSelector( selector );
		
		if( !selectors || selectors.length == 0 )
		{
			return $();
		}
		
		if( !options.all )
		{
			selectors.length = 1;
		}
		
		var nodes = [];
		
		var curElement, rootElement, previousElement, curRule, i, l, j, l2;
		
		selectors.forEach( function( rules ){
			
			rootElement = previousElement = null;
			
			for( i = 0, l = rules.length; i < l; i++ )
			{
				curRule = rules[i];
				
				if( curRule.tag == '' || curRule.tag == '*' )
				{
					curRule.tag = options.defaultTag;
				}
				
				curElement = $( '<'+curRule.tag+' />' );
				
				if( curRule.id != '' )
				{
					curElement.attr( 'id', curRule.id );
				}
				
				if( curRule.classes.length > 0 )
				{
					curElement[0].className = curRule.classes.join( ' ' );
				}
				
				if( curRule.attributes.length > 0 )
				{
					for( j = 0, l2 = curRule.attributes.length; j < l2; j++ )
					{
						curElement.attr( curRule.attributes[j].key, curRule.attributes[j].value );
					}
				}
				
				if( previousElement )
				{
					if( curRule.relationship == '+' || curRule.relationship == '~' ){
						previousElement = previousElement.parent();
					}
					previousElement.append( curElement );
					previousElement = curElement;
				}
				else
				{
					previousElement = rootElement = curElement;
				}
			}
			
			nodes.push( rootElement[0] );
		});
		
		return $( nodes );
	}
	
	this.getBlockInput = function( selector, by){
        var curBlocking = $(selector).attr( 'data-blocking' );
        
        if( !curBlocking )
        {
            return false;
        }
        else if( by == '__default__' )
        {
            return !!curBlocking;
        }
        else
        {
            return $.inArray( by, curBlocking.split( ' ' ) ) != -1;
        }
    }
	
    this.setBlockInput = function( selector, doBlock, by )
    {
        by = by || '__default__';
        selector = $(selector);
        doBlock = !!doBlock;
        
        //should not be called twice with the same set of arguments
        function blockElementKey( element, by, hash )
        {
            if( element.attr( 'data-tabindex' ) == null )//is it currently blocked?
            {
                //if not, block it
                element
                    .attr( 'data-tabindex', element.attr( 'data-tabindex' ) || 'none' )
                    .attr( 'tabindex', '-1' )//block it
            }
            
            //update record of who's blocking this element
            var curBlockedBy = element.attr( 'data-blocked-by' );
            var curBlockedHash = element.attr( 'data-blocked-hash' );
            
            element
                .attr( 'data-blocked-by', !curBlockedBy ? by : curBlockedBy+' '+by )//record who blocked it!
                .attr( 'data-blocked-hash', !curBlockedHash ? hash : curBlockedHash+' '+hash );
        }
        
        //only call if this element is actually blocked
        function unblockElementKey( element, by, hash )
        {
            var curBlockedBy = element.attr( 'data-blocked-by' ).split( ' ');
            var curBlockedHash = element.attr( 'data-blocked-hash' ) . split( ' ' );
            var i;
            
            if( by == '__default__' )//remove all blocks from this element
            {
                for( i = curBlockedHash.length-1; i > -1 ; --i )
                {
                    if( curBlockedHash[i] == hash )
                    {
                        curBlockedHash.splice( i, 1 );
                        curBlockedBy.splice( i, 1 );
                    }
                }
            }
            else
            {
                for( i = curBlockedHash.length-1; i > -1 ; --i )
                {
                    if( curBlockedHash[i] == hash && curBlockedBy[i] == by ){
                        curBlockedHash.splice( i, 1 );
                        curBlockedBy.splice( i, 1 );
                        break;
                    }
                }
            }
            
            if( curBlockedBy.length == 0 )//no longer blocked
            {
                var tabindex = element.attr( 'data-tabindex' );//get stored tabindex
                element
                    .attr( 'tabindex', tabindex == 'none' ? null : tabindex )
                    .attr( 'data-tabindex', null )//delete stored tabindex
                    .attr( 'data-blocked-by', null )//delete blocked by data
                    .attr( 'data-blocked-hash', null );
            }
            else
            {
                //update blocked data
                curBlockedBy = curBlockedBy.join( ' ' );
                curBlockedHash = curBlockedHash.join( ' ' );
                
                element
                    .attr( 'data-blocked-by', curBlockedBy )
                    .attr( 'data-blocked-hash', curBlockedHash );
            }
        }
        
        function getElementBlockedKey( element, by, hash )
        {
            var blocked = element.attr( 'data-blocked-by' );

            if( !blocked )
            {
                return false;
            }
            else
            {
                blocked = blocked.split( ' ' );
                var blocker = element.attr( 'data-blocked-hash' ).split( ' ' )
                
                for( var i = blocked.length-1; i > -1; --i )
                {
                    if( ( blocked[i] == by || by == '__default__' ) && blocker[i] == hash )
                    {
                        return true;
                    }
                }
                
                return false;
            }
        }
        
        selector.each( function(){
            var $this = $(this);
            
            var isBlocked = self.getBlockInput( $this, by );
            
            
            if( isBlocked != doBlock )
            {
                //this has changed
                var hash = $this.hash();
                var elements;
                
                //get block mouse input element
                var blockElement = $this.children( '.__blockElement__' );
                var dataBlocking
                
                if( doBlock )
                {
                    //record that this blocking is present
                    dataBlocking = $this.attr( 'data-blocking' )
                    $this.attr( 'data-blocking', !dataBlocking ? by : $this.attr( 'data-blocking' )+' '+by )
                    
                    //all keyboard accessible elements
                    elements = $this.find( 'a, input, button, select, textarea, [tabindex]' );//.filter( ':not([data-tabindex])' );
                    
                    elements.each( function(){
                        var $this = $(this);
                        //if they aren't already..
                        if( !getElementBlockedKey( $this, by, hash ) )
                        {
                            //block them!
                            blockElementKey( $this, by, hash );
                        }
                    });
                    
                    //create block mouse input element if required
                    if( blockElement.length == 0 ){
                        
                        if( $this.css( 'position' ) == 'static' )
                        {
                            $this.css( 'position', 'relative' );
                        }
                        blockElement = $( '<div />' ).addClass( '__blockElement__' ).appendTo( $this ).css( {position:'absolute', top:0, left:0, bottom:0, right:0, 'z-index':999999999, background:'transparent url(data:image/gif;base64,R0lGODlhAQABAPAAAP) repeat' } );
                    }
                    
                    blockElement.show();
                }
                else//unblock
                {
                    if( by == '__default__' )
                    {
                        $this.attr( 'data-blocking', null );
                        
                        //unblock mouse input
                        blockElement.hide();
                    }
                    else
                    {
                        dataBlocking = $this.attr( 'data-blocking' ).split( ' ' );
                        dataBlocking.splice( $.inArray( by, dataBlocking ), 1 );
                        
                        $this.attr( 'data-blocking', dataBlocking.join( ' ' ) );
                        
                        if( dataBlocking.length == 0 )
                        {
                            //unblock mouse input
                            blockElement.hide();
                        }
                    }
                    
                    elements = $this.find( '[data-tabindex]' );
                    
                    elements.each( function(){
                        unblockElementKey( $(this), by, hash );
                    });
                }
            }
        });
    }
	
	this.getPageScroll = function(outputVector){
		outputVector = outputVector || new Vector2();
		
		outputVector.x = document.documentElement.scrollLeft || window.pageXOffset;
		outputVector.y = document.documentElement.scrollTop || window.pageYOffset;
		
		return outputVector;
	}

	this.setPageScroll = function(x, y){
		if( typeof( x ) == 'object' || ( x instanceof Vector2 ) ){
			y = x.y;
			x = x.x;
		}else if(y === undefined){
			y = x;
			x = null;
		}
		
		if(!isNaN(x)){
			x = Math.max( 0, x );

			window.pageXOffset = x;
			document.documentElement.scrollLeft = x;
			document.body.scrollLeft = x;
		}
		
		if(!isNaN(y)){
			y = Math.max( 0, y );

			window.pageYOffset = y;
			document.documentElement.scrollTop = y;
			document.body.scrollTop = y;
		}
	}
	
	
	/*TODO Add custom events*/
	/*var borderRadius = styleSupport( "borderRadius" );
	// Set cssHooks only for browsers that support a vendor-prefixed border radius
	if ( borderRadius && borderRadius !== "borderRadius" ) {
		$.cssHooks.borderRadius = {
			get: function( elem, computed, extra ) {
				return $.css( elem, borderRadius );
			},
			set: function( elem, value) {
				elem.style[ borderRadius ] = value;
			}
		};
	}*/

	var events = {
		'transitionend':'transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd MSTransitionEnd', 
		'animationstart':'animationstart webkitAnimationStart mozAnimationStart oAnimationStart MSAnimationStart', 
		'animationiteration':'animationiteration webkitAnimationIteration mozAnimationIteration oAnimationIteration MSAnimationIteration', 
		'animationend':'animationend webkitAnimationEnd mozAnimationEnd oAnimationEnd MSAnimationEnd'
	};
	
	for( var event in events )
	{
		
		/*var eventNames = events[event];
		
		console.log(event, div[event]);
		
		for( var i = 0; i < eventNames.length; i++ )
		{
			console.log(eventNames[i], div[eventNames[i]]);
		}
		console.log( ' ' );*/
		
		$.event.special[event] = {
			add:function( handleObj ){
				/*var specialObj = $.event.special[handleObj.type];
				
				var eventNames = events[handleObj.type];
				
				var handler = function(event){
					arguments.callee.handler.call(  );
				}
				
				handler.handler = handleObj.handler;
				handler.guid = handleObj.guid;
				
				if( handleObj.selector )
				{
					$(this).on( eventNames, handleObj.selector, handler );
				}
				else
				{
					$(this).on( eventNames, handler );
				}
				
				$.event.special[handleObj.type] = specialObj;
				
				handleObj.handler = null;
				
				return false;*/
			},
			remove:function( handleObj ){
				var specialObj = $.event.special[handleObj.type];
				
				var eventNames = events[handleObj.type];
				
				//need to get the 
				
				$.event.special[handleObj.type] = specialObj;
				
				
			}
		};
	}
	
}