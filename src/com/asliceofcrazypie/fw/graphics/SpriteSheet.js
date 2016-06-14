//#import com.asliceofcrazypie.fw.Base
//#import com.asliceofcrazypie.fw.graphics.SpriteDefinition

//#class com.asliceofcrazypie.fw.graphics.SpriteSheet extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function( ids, spriteDefinitions ){
		base.constructor.call( this );
		
		this._ids = ids;
		this._spriteDefinitions = spriteDefinitions;
		
		var idIndex = {};
		
		ids.forEach( function( value, index ){
			idIndex[value] = index;
		} );
		
		this._idIndex = idIndex;
	}
	
	this.forEach = function( handler/*string id, SpriteDefinition definition*/ )
	{
		this._ids.forEach( function( value, index ){
			handler( value, this._spriteDefinitions[index] );
		}, this);
	}
	
	this.getSpriteDefinitionById = function( id ){
		if( id in this._idIndex )
		{
			return this._spriteDefinitions[this._idIndex[id]];
		}
		
		return null;
	}
	
	Self.fromObj = function( image, obj ){
		if( !image || !obj )
		{
			throw new Error( 'invalid arguments' );
		}
		
		var definitions = [];
		var ids = [];
		var curObj;
		
		if( typeof( image ) == 'string' )
		{
			var imgSrc = image;
			image = new Image();
			
			image.src = imgSrc;
		}
		
		for( var id in obj )
		{
			curObj = obj[id];
			
			if( curObj )
			{
				ids.push( id );
				
				definitions.push( new SpriteDefinition( id, parseInt( curObj.width ), parseInt( curObj.height ), image, parseFloat( curObj.centerX ) || 0, parseFloat( curObj.centerY ) || 0, parseFloat( curObj.offsetX ) || 0, parseFloat( curObj.offsetY ) || 0 ) );
			}
		}
		
		return new Self( ids, definitions );
	}
	
	Self.fromXML = function( image, xml ){
		if( !image || !xml )
		{
			throw new Error( 'invalid arguments' );
		}
		
		var definitions = [];
		var ids = [];
		
		$(xml).find('image').each( function()
		{
			var id = this.attributes.name.value
			var position = this.attributes.position.value.split( ',' );
			ids.push( id );
			definitions.push( new SpriteDefinition( id, parseInt( position[2] ), parseInt( position[3] ), image, parseFloat( position[4] ) || 0, parseFloat( position[5] ) || 0, parseFloat( position[0] ) || 0, parseFloat( position[1] ) || 0 ) );
		})
		
		return new Self( ids, definitions );
	}
	
	Self.factory = function( image, data )
	{
		if( !image || !data )
		{
			throw new Error( 'invalid arguments' );
		}
		
		if( data instanceof Document )
		{
			return Self.fromXML( image, data );
		}
		else
		{
			return Self.fromObj( image, data );
		}
	}
}