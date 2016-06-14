//#import com.asliceofcrazypie.fw.Base
//#import com.asliceofcrazypie.fw.ui.InteractionPoint

//#class com.asliceofcrazypie.fw.ui.Interaction extends com.asliceofcrazypie.fw.Base
function( base ){
    this.constructor = function( evt, phase ){
        base.constructor.call( this );//page position
        
        var now = new Date();
        var element = $(evt.target);
        var currentTarget = $(evt.currentTarget)
        var type;
        
        if( evt.type == 'click' || evt.type.indexOf( 'mouse' ) == 0 ){
            type = 'mouse';
        }
        else if( evt.type.indexOf( 'touch' ) == 0 ){
            type = 'touch';
        }
        else if( evt.type.indexOf( 'key' ) == 0 ){
            type = 'key';
        }
        else
        {
            type = 'unknown'
        }
        
        this.phase = this._addReadOnly( phase );
        this.event = this._addReadOnly( evt );
        this.time = this._addReadOnly( now );
        this.type = this._addReadOnly( type );
        this.element = this._addReadOnly( element );
        this.currentTarget = this._addReadOnly( currentTarget );
        
        this._addReadOnly( 'points', [] );//list of interaction points
        
        switch( type )
        {
            case 'mouse':
                this.points[0] = new InteractionPoint( evt.pageX, evt.pageY, element, currentTarget, now );
                break;
            case 'touch':
                var touchEvent = evt.originalEvent, currentTouch, touches = phase == 'end' ? touchEvent.changedTouches : touchEvent.touches;
                
                for( var i = 0; i < touches.length; i++ )
                {
                    currentTouch = touches[i];
                    
                    this.points[i] = new InteractionPoint( currentTouch.pageX, currentTouch.pageY, element, $( currentTouch.target ), now )
                }
                break;
            case 'key':
                break;
            default:
                break;
        }
		
		Object.freeze( this.points );//make read only
        
        this.size = this._addReadOnly( this.points.length );
    }
    
    this.preventDefault = function(){
        this.event.preventDefault();
    }
    
    this.isDefaultPrevented = function(){
        return this.event.isDefaultPrevented();
    }
    
    this.stopPropagation = function(immediate){
        if( immediate )
        {
            this.event.stopImmediatePropagation();
        }
        else
        {
            this.event.stopPropagation();
        }
    }
}