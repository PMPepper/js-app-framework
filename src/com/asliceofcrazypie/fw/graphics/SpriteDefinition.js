//#import com.asliceofcrazypie.fw.Base

//#class com.asliceofcrazypie.fw.graphics.SpriteDefinition extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( id, width, height, image, centerX, centerY, offsetX, offsetY ){
		base.constructor.call( this );
		
		this._addReadOnly( 'id', id );
		this._addReadOnly( 'width', width );
		this._addReadOnly( 'height', height );
		this._addReadOnly( 'image', image );
		this._addReadOnly( 'centerX', centerX );
		this._addReadOnly( 'centerY', centerY );
		this._addReadOnly( 'offsetX', offsetX );
		this._addReadOnly( 'offsetY', offsetY );
	}
	
	Self.createCanvasDefinition = function( width, height ){
		return new Self( 'canvas', width, height, $('<canvas width="'+width+'" height="'+height+'" style="width:'+width+'px;height:'+height+'px;" />')[0], 0, 0, 0, 0 );
	}
}