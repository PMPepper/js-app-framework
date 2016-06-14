//#import com.asliceofcrazypie.fw.widgets.UIWidget
//#import com.asliceofcrazypie.fw.widgets.Widget
//#import com.asliceofcrazypie.fw.html.DOM

//#class com.asliceofcrazypie.fw.widgets.MenuWidget extends com.asliceofcrazypie.fw.widgets.UIWidget
function( base ){
	this.constructor = function( element, options ){
		base.constructor.call( this, element, options );
		
		element = this.element;
		options = this.options;
		
		
		this._menuOptions = [];
		this._menuOptionValues = {};
		this._menuOptionIndexes = {};
		
		this._currentIndex = -1;
		this._currentOption = null;
		this._currentValue = null;
		
		this._onItemOver = onItemOver.bind( this );
		this._onMenuItemKeyPress = onMenuItemKeyPress.bind( this )
		this._onItemClicked = onItemClicked.bind( this )
		
		this._setOptions();
		
		if( options.init && this._menuOptionValues[options.init] ){
			this.setActiveOption( this._menuOptionValues[options.init] );
		}
	}
	
	Self.__init__ = function(){
		Widget.register( Self, {
			init:null,
			optionSelector:'li button',
			verticalKeyboardSelection:true,
			horizontalKeyboardSelection:true,
			enableKeyboardInput:true,
			options:{
				layout:{
					writable:true,
					values:['horizontal', 'vertical'],
					value:'vertical'
				}
			}
		} );
	}
	
	this.addOptions = function( name, label, attrs ){
		var optionElement = DOM.elementFromSelector( this.options.optionSelector );
		
		if( attrs )
		{
			optionElement.attr( attrs );
		}
		
		optionElement.find( 'button' ).val( name ).append( label );
		
		this.element.append( optionElement );
		
		this._setOptions();
	}
	
	this.setActiveOption = function( option )
	{
		if( typeof( option ) == 'string' )
		{
			option = this._menuOptionValues[options];
		}
		else if( typeof( option ) == 'number' )
		{
			option = option%this._menuOptions.length;
			option = option < 0 ? this._menuOptions.length + option : option;
			
			option = this._menuOptions[option];
		}
		else
		{
			option = $(option);
		}
		
		var value = option.attr( 'value' );
		
		if(  value != this._currentValue )
		{
			if( !option.is( '[disabled]' ) )
			{
				var oldValue = this._currentValue;
				var oldIndex = this._currentIndex;
				
				this._currentValue = value;
				this._currentIndex = this._menuOptionIndexes[value];
				this._currentOption = option;
				
				option.focus();
				
				this.dispatchEvent( { type:'change', value:value, index:this._currentIndex, oldValue:oldValue, oldIndex:oldIndex } );
				
				return true;
			}
		}
		
		return false;
	}
	
	this._setOptions = function()
	{
		var value, options = this.options, element = this.element;
		
		if( this._allMenuOptions )
		{
			this._allMenuOptions
				.off( 'mouseenter touchenter', this._onItemOver )
				.off( 'keydown', this._onMenuItemKeyPress )
				.off( 'click', this._onItemClicked );
		}
		
		this._menuOptions.length = this._menuOptionValues.length = this._menuOptionIndexes.length = 0;
		
		this._allMenuOptions = element.find( options.optionSelector );
		
		for( var i = 0, l = this._allMenuOptions.length; i < l; i++ )
		{
			this._menuOptions[i] = $(this._allMenuOptions[i]);
			
			value = this._menuOptions[i].attr( 'value' );
			
			this._menuOptionValues[value] = this._menuOptions[i];
			this._menuOptionIndexes[value] = i;
		}
		
		this._allMenuOptions
			.on( 'mouseenter touchenter', this._onItemOver )
			.on( 'keydown', this._onMenuItemKeyPress )
			.on( 'click', this._onItemClicked );
	}
	
	function onItemClicked( e ){
		this.dispatchEvent( {type:'selected', value:this._currentValue, index:this._currentIndex } );
	}
	
	function onMenuItemKeyPress( e ){
		options = this.options;
		var dir = 0;
		
		if( !options.enableKeyboardInput )
		{
			return;
		}
		
		if( options.verticalKeyboardSelection && ( e.which == 38 || e.which == 40 ) )
		{
			dir = ( e.which == 40 ? 1 : -1 );
			
			e.preventDefault();
			e.stopPropagation();
		}
		else if( options.horizontalKeyboardSelection && ( e.which == 37 || e.which == 39 ) )
		{
			dir = ( e.which == 39 ? 1 : -1 );
			
			e.preventDefault();
			e.stopPropagation();
		}
		
		if( dir != 0 )
		{
			var dist = 1;
			
			while( dist < this._menuOptions.length && !this.setActiveOption( this._currentIndex + ( dist * dir ) ) )
			{
				dist++;
			}
		}
	}
	
	function onItemOver( e ){
		this.setActiveOption(e.target);
	}
}