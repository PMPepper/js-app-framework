//#import com.asliceofcrazypie.fw.EventDispatcher

//#class com.asliceofcrazypie.fw.geom.Grid extends com.asliceofcrazypie.fw.EventDispatcher
function( base ){
	this.constructor = function( columns, rows, contents ){
		base.constructor.call( this );
		
		this._addReadOnly( 'columns', columns );
		this._addReadOnly( 'rows', rows );
		this._addReadOnly( 'size', columns * rows );
		
		this._squares = new Array( this.size );
		
		if( contents )
		{
			for( var i = 0; i < contents.length; i++ )
			{
				this._squares[i] = contents[i];
			}
		}
	}
	
	this.forEachSquare = function( callback ){
		this._squares.forEach( function( square ){
			callback( square );
		});
	}
	
	this.getSquareAtIndex = function( index )
	{
		return this._squares[index];
	}
	
	this.getSquareAt = function( x, y ){
		return this._squares[(y*this.columns)+x];
	}
	
	this.slice = function( x, y, width, height, inclusive ){
		inclusive = !!inclusive;
		
		var left, right, top, bottom, cx, cy;
		
		if( inclusive )
		{
			left = Math.floor( x );
			top = Math.floor( y );
			right = Math.ceil( x + width );
			bottom = Math.ceil( y + height );
		}
		else
		{
			left = Math.ceil( x );
			top = Math.ceil( y );
			right = Math.floor( x + width );
			bottom = Math.floor( y + height );
		}
		
		if( left < 0 )
		{
			left = 0;
		}
		else if( left > this.columns )
		{
			left = this.columns;
		}
		
		if( top < 0 )
		{
			top = 0;
		}
		else if( top > this.rows )
		{
			top = this.rows;
		}
		
		if( right > this.columns )
		{
			right = this.columns;
		}
		else if( right < 0 )
		{
			right = 0;
		}
		
		if( bottom > this.rows )
		{
			bottom = this.rows;
		}
		else if( bottom < 0 )
		{
			bottom = 0;
		}
		
		var slice = new Array( (right-left)*(bottom-top) ), i = 0, squares = this._squares;
		
		for( cx = left; cx < right; cx++ )
		{
			for( cy = top; cy < bottom; cy++ )
			{
				slice[i++] = squares[(cy*this.columns)+cx]
			}
		}
		
		return slice;
	}
	
	this.dispose = function(){
		if( !this.__isDisposed )
		{
			var square;
			for( var i = 0; i < this.size; i++ )
			{
				square = this._squares[i];
				
				if( square && ( square.dispose instanceof Function ) )
				{
					square.dispose();
				}
			}
			
			this._squares.length = 0;
			this._squares = null;
			
			base.dispose.call( this );
		}
	}
}