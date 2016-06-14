//#import com.asliceofcrazypie.fw.Base
//#import com.asliceofcrazypie.fw.geom.Vector2
//#import com.asliceofcrazypie.fw.geom.LineSegment

//#class com.asliceofcrazypie.fw.geom.Intersection extends com.asliceofcrazypie.fw.Base
function(base){
    this.constructor = function(){
		base.constructor.call( this );
		
		this.type = null;
		this._addReadOnly( 'points', [] );
	}
		
		
	Self.NONE = 'none';
	Self.STANDARD = 'standard';
	Self.TANGENT = 'tangent';
	
	this.set = function( type /*Vector2*/ )
	{
		this.type = type;
		
		for( var i = 1; i < arguments.length; i++ )
		{
			this.points.push( arguments[i] );
		}
	}
		
	this.toString = function()
	{
		return '[Intersect type='+this.type+', points='+this.points+']';
	}
		
	Self.check = function ( a, b )
	{
		if( a instanceof LineSegment )
		{
			if( b instanceof LineSegment )
			{
				return Self._lineSegmentLineSegment( a, b );
			}
		}
		
		return null;
	}
	
	this._lineSegmentLineSegment =function ( a, b )
	{
		var x1 = a.x1;
		var y1 = a.y1;
		var x2 = a.x2;
		var y2 = a.y2;
		
		var x3 = b.x1;
		var y3 = b.y1;

		var x4 = b.x2;
		var y4 = b.y2
		
		var xi = 0, yi = 0, d1 = x2 - x1, d2 = x4 - x3;
		
		if( !d1 )
		{
			if( !d2 )
			{
				return Self.get().set( Self.NONE );
			}
		
			xi = x1;
			yi = y3 + ( y4 - y3 ) * ( x1 - x3 ) / d2;
		}
		else if( !d2 )
		{
			xi = x3;
			yi = y1 + ( y2 - y1 ) * ( x3 - x1 ) / d1;
		}
		else
		{
			var m1 = ( y2 - y1 ) / d1, m2 = ( y4 - y3 ) / d2;
			
			if( m1 == m2 )
			{
				return Self.get().set( Self.NONE );
			}
			
			var c1 = y1 - m1 * x1, c2 = y3 - m2 * x3;
			var d = m2 - m1;
			xi = ( c1 - c2 ) / d;
			yi = ( m2 * c1 - m1 * c2 ) / d;
		}
		
		if( d1 > 0 )
		{
			if( xi < x1 || xi > x2 )
			{
				return Self.get().set( Self.NONE );
			}
		}
		else if( d1 < 0 )
		{
			if( xi > x1 || xi < x2 )
			{
				return Self.get().set( Self.NONE );
			}
		}
		else if( ( yi < y1 && yi < y2 ) || ( yi > y1 && yi > y2 ) )
		{
			return Self.get().set( Self.NONE );
		}
		
		if( d2 > 0 )
		{
			if( xi < x3 || xi > x4 )
			{
				return Self.get().set( Self.NONE );
			}
		}
		else if( d2 < 0 )
		{
			if( xi > x3 || xi < x4 )
			{
				return Self.get().set( Self.NONE );
			}
		}
		else if( ( yi < y3 && yi < y4 ) || ( yi > y3 && yi > y4 ) )
		{
			return Self.get().set( Self.NONE );
		}
		
		return Self.get().set( Self.STANDARD, Vector2.get().set( xi, yi ) );
	}
	
	this.dispose = function(){
		base.dispose.call( this );
		
		this.reset();
	}
	
	this.reset = function(){
		this.type = null;
		
		while( this.points.length > 0 )
		{
			Vector2.release( this.points.pop() );
		}
	}
	
	Self.__init__ = function(){
		ACPF.makeAutoPool( Self, 10, 1000 );
	}
}