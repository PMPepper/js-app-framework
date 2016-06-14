//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.geom.Vector3 extends com.asliceofcrazypie.fw.Base
function(base){
    this.constructor = function( x, y, z ){
		base.constructor.call( this );
		
        //default to zero
        this.x = x||0;
        this.y = y||0;
        this.z = z||0;
    }
	
	//TODO how do these work?
	/*getters/setters*/
	/*this._addAccessor( 
		'length',
		function(){ return Math.sqrt( this.x*this.x + this.y*this.y ); },
		function(value){ var length = this.length; this.x = length * Math.cos( value ); this.y = length * Math.sin( value ); } 
	);
	
	this._addAccessor( 
		"radians", 
		function(){ return Math.atan2( this.y, this.x ); },
		function(value){ var length = this.length; this.x = length * Math.cos( value ); this.y = length * Math.sin( value ); }
	);*/
    /*end getters/setters*/
	
	/*public methods*/
    this.add = function( vector, out )
    {
		out = out || new Self();
		
		out.x = this.x + vector.x;
		out.y = this.y + vector.y;
		out.z = this.z + vector.z;
		
        return out;
    }
	
	
    this.subtract = function( vector, out )
    {
        out = out || new Self();
        
        out.x = this.x - vector.x;
        out.y = this.y - vector.y;
        out.z = this.z - vector.z;
        
        return out;
    }
    
    this.multiply = function ( by, out )
    {
        out = out || new Self();
        
        out.x = this.x * by;
        out.y = this.y * by;
        out.z = this.z * by;
        
        return out;
    }
    
	/*
    this.distance = function( from, skipSqrt )
    {
        if( from )
        {
            var dx = this.x - from.x;
            var dy = this.y - from.y;
            var d = dx*dx + dy*dy;
            
            return ( skipSqrt ) ? d : Math.sqrt( d );
        }
        
        return 0;
    }*/
    
    /*this.angle = function( from )
    {
        if( from ){
            return Math.atan2( this.y - from.y, this.x - from.x );
        }
        
        return 0;
    }
    */
    
    this.toString = function(){
        return '[Vector x="'+this.x+'" y="'+this.y+'" z="'+this.z+'"]';
    };
	
	this.equal = function( vector ){
		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z||0;
		
		return this;
	}
	
	this.set = function( x, y, z ){
		this.x = x;
		this.y = y;
		this.z = z;
		
		return this;
	}
	
	this.clone = function()
	{
		return new Self( this.x, this.y, this.z );
	}
	
	this.reset = function(){
		this.x = this.y = this.z = 0;
	}
	/*end public methods*/
	
	
	
	Self.__init__ = function(){
		ACPF.makeAutoPool( Self, 10, 1000 );
	}
}


