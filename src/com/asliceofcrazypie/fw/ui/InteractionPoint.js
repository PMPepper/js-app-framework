//#import com.asliceofcrazypie.fw.geom.Vector2
//#import com.asliceofcrazypie.fw.html.Metrics

//#class com.asliceofcrazypie.fw.ui.InteractionPoint extends com.asliceofcrazypie.fw.geom.Vector2
function( base ){
    this.constructor = function( x, y, element, targetElement, time ){
        
        base.constructor.call( this, x, y );//page position
        
        //TODO make these getters that are only calculated as and when they are needed
        //this.windowPosition = NC.Metrics.pageToWindow( this );
        //this.elementPosition = NC.Metrics.pageToElement( element, this );
        
        this.element = this._addReadOnly( element );
        this.targetElement = this._addReadOnly( targetElement );
        this.time = this._addReadOnly( time );
    }
    
    this.windowPosition = function()
    {
		var pos = Metrics.pageToWindow( this );
        
        this.windowPosition = function(){
            return pos;
        }
        
        return pos;
		throw new Error( 'not implemented' );
    }
    
    this.elementPosition = function( element)
    {
        var tElement = this.element;
        var isThisElement = false;
        
        if( typeof( element ) == 'undefined' )
        {
            element = tElement;
        }
        else
        {
            element = $(element);
        }
        
        if( element[0] == tElement[0] )
        {
            isThisElement = true;
        }
        
        if( isThisElement && this._elementPos )
        {
            return this._elementPos;
        }
        
		var pos = Metrics.pageToElement( element, this );
        
        if( isThisElement )
        {
            this._elementPos = pos;
        }
        
        return pos;
    }
    
    this.targetElementPosition = function()
    {
		var pos = Metrics.pageToElement( this.targetElement(), this );
        
        this.targetElementPosition = function(){
            return pos;
        }
        
        return pos;
    }
}