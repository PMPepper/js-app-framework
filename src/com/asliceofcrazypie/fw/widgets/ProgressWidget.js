//#import com.asliceofcrazypie.fw.widgets.UIWidget
//#import com.asliceofcrazypie.fw.widgets.Widget
//#import com.asliceofcrazypie.fw.util.NumberUtil

//#class com.asliceofcrazypie.fw.widgets.ProgressWidget extends com.asliceofcrazypie.fw.widgets.UIWidget
function( base ){
	this.constructor = function( element, options ){
		base.constructor.call( this, element, options );
		
		element = this.element;
		options = this.options;
	}
	
	this.setProgress = function( value, of )
	{
		var options = this.options, max = of;
		
		if( options.max !== null && of > options.max )
		{
			max = options.max;
		}
		
		var min = options.min === null ? 0 : options.min;
		var range = max - min;
		
		var valueLimited = NumberUtil.limit( value, min, max );
		
		this._value = value;
		this._of = of;
		this._min = min;
		this._max = max;
		
		var sizeVar = options.vertical ? 'height' : 'width';
		var size = ( NumberUtil.limit( ( valueLimited - min ) / range, 0, 1 ) * 100 ) + '%';
		this.element.find( options.barSelector ).css( sizeVar, size );
	}
	
	Self.__init__ = function(){
		Widget.register( Self, {
			init:0,
			min:null,
			max:null,
			resolution:0,
			vertical:false,
			preventDecrease:false,
			barSelector:'.ProgressWidget-bar',
			aciveClass:'active',
			options:{
				layout:{
					writable:true,
					values:['horizontal', 'vertical'],
					value:'horizontal'
				}
			}
		} );
	}
}