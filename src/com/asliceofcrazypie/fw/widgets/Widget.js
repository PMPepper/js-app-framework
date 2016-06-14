//#import com.asliceofcrazypie.fw.EventDispatcher
//#import com.asliceofcrazypie.fw.ReadOnly

//#class com.asliceofcrazypie.fw.widgets.Widget extends com.asliceofcrazypie.fw.EventDispatcher
function( base ){
    
    this.constructor = function( element, options ){
        base.constructor.call( this );
        
        this._addReadOnly( 'options', new ReadOnly( $.extend( true, this.constructor._defaultOptions, this._parseOptions( options ) ) ), true );
        this._addReadOnly( 'element', $(element) );
		
		//Parse widget 'options'
		this._configOptions = {};
		
		if( this.options.options )
		{
			var optionItem, elementClasses = this.element.classes(), match, matchResult, i, l = elementClasses.length, optionValue;
			
			for( var option in this.options.options )
			{
				optionItem = this.options.options[option];
				
				//normalise option data
				this._configOptions[option] = { value:optionItem.value || null, values:optionItem.values || null, writable:optionItem.writable || false }
				
				//match init HTML? Only if value is null
				if( optionItem.value === null  )
				{
					match = new RegExp( '^'+this.cssClass()+'-'+option+'_([-_a-zA-Z0-9]+)$' );
					
					for( i = 0; i < l; i++ )//for each class
					{
						if( ( matchResult = elementClasses[i].match( match ) ) )
						{
							if( typeof( this.setOption( option, matchResult[1] ) ) != 'undefined' )
							{
								break;
							}
						}
					}
				}
				else
				{
					optionValue = this._configOptions[option].value;
					this._configOptions[option].value = null;
					this.setOption( option, optionValue );
				}
			}
		}
		
		$.data( this.element[0], 'ACPF.widget', this );
        
        this._updateRate = null;
    }
	
	this.cssClass = function(){
		return this.constructor.cssClass;
	}
	
	this.getOption = function( name ){
		if( name in this._configOptions )
		{
			return this._configOptions[name].value;
		}
		
		return undefined;
	}
	
	this.setOption = function( name, value ){
		if( typeof( name ) == 'string' && ( name in this._configOptions ) )
		{
			var configOption = this._configOptions[name];
			
			if( !configOption.values || configOption.values.indexOf( value ) > -1 )
			{
				if( configOption.writable && value != configOption.value )//is writable & anything has changed
				{
					var oldValue = configOption.value;
					
					//update css classes
					this.element.removeClass( this.cssClass()+'-'+name+'_'+oldValue ).addClass( this.cssClass()+'-'+name+'_'+value );
					
					//record value
					this._configOptions[name].value = value;
				}
				
				return value;
			}
		}
		
		return undefined;
	}
	
	Object.defineProperty( Self, 'WIDGET_NAMESPACE', { value:'', 
			configurable:false, 
			enumerable:false,
			writable:false 
		}
	);
	
	Object.defineProperty( Self, 'WIDGET_INITED_CLASS', { value:this.WIDGET_NAMESPACE+'__inited', 
			configurable:false, 
			enumerable:false,
			writable:false 
		}
	);
	
	
	this.dispose = function(){
		this._updateRate = 0;
		this.element.remove();
		
		base.dispose.call( this );
	}
	
    this.on = function( events, handler, element )
    {
        if( typeof( events ) == 'string' )
        {
            events = events.split( ' ' );
        }
        
        element = element != null ? $( element ) : this.element();
        var curEvent;
        
        for( var i = 0; i < events.length; i++ )
        {
            curEvent = events[i];
            
            element.on( events[i], handler );
        }
    }
    
    this.off = function( events, handler, element )
    {
        if( typeof( events ) == 'string' )
        {
            events = events.split( ' ' );
        }
        
        element = element != null ? $( element ) : this.element();
        
        for( var i = 0; i < events.length; i++ )
        {
            element.off( events[i], handler );
        }
    }
	
	/* start getters/setters */
	
	/*updateRate: 1 = every paint/60fps 2 = every other paint/30fps*/
	this._addAccessor( 'updateRate', function(){
			return this._updateRate;
		},
		function( updateRate ){
			updateRate = Math.round( updateRate );
			
			if( updateRate != this._updateRate && updateRate > 0 )
			{
				var updateIndex = 0;
				var handler = function(){
					if( updateIndex++ % updateRate == 0 ){
						this._onUpdate();
					}

					if( updateRate == this._updateRate )
					{
						//keep running
						window.requestAnimationFrame( handler );
					}
				}.bind(this);

				window.requestAnimationFrame( handler )

				//finally record new rate
				this._updateRate = updateRate;
			}
			else if( updateRate == 0 )
			{
				this._updateRate = 0;//this will stop the update rate
			}
		}
    );
	
    /* end getters/setters */
    
    var FIND_OR_CREATE_ELEMENT_OPTIONS = { addMethod:'append' };
    
    this._findOrCreateElement = function( elementSelector, elementToCreate, parent, options )
    {
        options = $.extend( {}, FIND_OR_CREATE_ELEMENT_OPTIONS, options );
        parent = parent || this.element();
        
        var element = parent.find( elementSelector );
        
        if( element.length == 0 )
        {
            //element not found
            element = $( elementToCreate );
            parent[options.addMethod]( element );
        }
        
        return element;
    }
    
    this._parseOptions = function( options ){
        switch( typeof( options ) )
        {
            case 'object':
                return options;
            case 'string':
                var str = $("<div/>").html(options).text();

                try{
                    if( str ){

                        if( str.charAt( 0 ) != '{' ){
                            str = '{'+str+'}';
                        }
                        options = $.parseJSON( str );
                    }
                    else{
                        options = {};
                    }

                    return options ? options : {} ;
                }
                catch(e){
                    //Netcel.error(e, str);//report any errors in parsing the options object
                    
                }

                return {};//final catch
            default://any other type
                return {};
        }
        
        
    }
    
    //static
    var allWidgetClasses = [];
    var allWidgetInitMethods = [];
	
	$.fn.widget = function(){
		return $.data( this[0], 'ACPF.widget' );
	}
    
    Self.register = function( widget, defaultOptions, initMethod )
    {
        //, definition, base, defaultOptions, initMethod
        var defaultOptions = defaultOptions || {};
        var initMethod = initMethod || defaultWidgetInit;
		
        //parse the name
        var nameParts = name.split( '.' );
        if( nameParts[0] != 'NC' )
        {
            nameParts.unshift( 'NC' );
        }
		
        //record widget props
        widget._defaultOptions = $.extend( {}, widget.parentClass._defaultOptions, defaultOptions );
        
        widget.cssClass = widget.cssClass || ( Self.WIDGET_NAMESPACE+widget.className );
        
        allWidgetClasses.push( widget );
        allWidgetInitMethods.push( initMethod.bind( widget ) );
        
        return widget;
    }
    
    function defaultWidgetInit( element ){
		var widgetElements = $( '.'+this.cssClass+':not( .' + Self.WIDGET_INITED_CLASS + ')', element );
        var widgetElement, options;
        
		var newWidgets = [];
		
        for( var i = 0; i < widgetElements.length; i++ )
        {
            widgetElement = $(widgetElements[i]);
            options = widgetElement.attr( 'data-'+this.cssClass+'-options' ) || widgetElement.attr( 'data-options' );
            
            newWidgets.push( new this( widgetElement, options ) );
        }
		
		return newWidgets;
    }
    
    //init widgets
	Self.initWidgets = function( element ){
		var newWidgets = [], initedWidgets;
		
        for( var i = 0; i < allWidgetInitMethods.length; i++ )
        {
			initedWidgets = allWidgetInitMethods[i]( element || document );
			
			initedWidgets.forEach( function(x){ newWidgets.push( x ) } );
			
            //newWidgets.push.apply( newWidgets, initedWidgets );
        }
		
		return newWidgets;
    }
    
	//init widgets on page load
    //$( Self.initWidgets );
}