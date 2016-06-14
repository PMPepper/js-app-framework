//#import com.asliceofcrazypie.fw.Base
//#import com.asliceofcrazypie.fw.geom.Vector2

//#class com.asliceofcrazypie.fw.geom.LineSegment extends com.asliceofcrazypie.fw.Base
function(base){
    this.constructor = function( x1, y1, x2, y2 ){
		base.constructor.call( this );
		
        //default to zero
        this.x1 = x1||0;
        this.y1 = y1||0;
        this.x2 = x2||0;
        this.y2 = y2||0;
    }
	
	/*getters/setters*/
	this._addAccessor( 
		'length',
		function(){ var dx = this.x1 - this.x2, dy = this.y1 - this.y2; return Math.sqrt( dx*dx + dy*dy ); }
	);
	
	this._addAccessor( 
		"radians", 
		function(){ var dx = this.x1 - this.x2, dy = this.y1 - this.y2;  return Math.atan2( dy, dx ); }
	);
    /*end getters/setters*/
	
	/*public methods*/
    this.start = function(){
		return Vector2.get().set( this.x1, this.y1 );
	}
    
	this.end = function(){
		return Vector2.get().set( this.x2, this.y2 );
	}
    
    this.toString = function(){
        return '[LineSegment x1="'+this.x1+'" y1="'+this.y1+'" x2="'+this.x2+'" y2="'+this.y2+'"]';
    };
	
	this.equal = function( lineSegment ){
		this.x1 = lineSegment.x1;
		this.y1 = lineSegment.y1;
		this.x2 = lineSegment.x2;
		this.y2 = lineSegment.y2;
		
		return this;
	}
	
	this.set = function( x1, y1, x2, y2 ){
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		
		return this;
	}
	
	this.clone = function()
	{
		return new Self( this.x1, this.y1, this.x2, this.y2 );
	}
	
	this.reset = function(){
		this.x1 = this.y1 = this.x2 = this.y2 = 0;
	}
	/*end public methods*/
	
	
	
	Self.__init__ = function(){
		ACPF.makeAutoPool( Self, 10, 1000 );
	}
}


