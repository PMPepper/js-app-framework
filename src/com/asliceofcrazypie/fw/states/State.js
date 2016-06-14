//#import com.asliceofcrazypie.fw.ds.EventNode

//#class com.asliceofcrazypie.fw.states.State extends com.asliceofcrazypie.fw.ds.EventNode
function( base )
{
	this.constructor = function(){
		base.constructor.call( this );
		
		this._isActive = false;
	}
	
	this.update = function(activeState, frameTime) 
	{
		var i = 0;
		var node;
		var activeChild = this.activeChild();
		
		this.forEachChild( function( node ){
			node.update( activeChild, frameTime );
		});
	}
	

	this.activated = function()
	{
		this._isActive = true;
	}
	
	this.deactivated = function() 
	{
		this._isActive = false;
	}
	
	
	this.activeChild = function()
	{
		return this.getChildAt( this.numChildren-1 );
	}
	
	this.switchActiveChild = function( node )
	{
		if ( node != null )
		{
			var activeChild = this.activeChild();
			
			this._noChildStateEvents = true;
			
			if( activeChild )
			{
				activeChild.deactivated();
				activeChild.dispose();
			}
			
			this.addChild( node );
			
			this._noChildStateEvents = false;
			
			if( !this._noChildStateEvents )
			{
				this.dispatchEvent( { type:'activechildchange', activeChild:node } );
			}
			
			node.activated();
			
		}
	}
	
	this._onChildAdded = function( node, index ){
		//console.log( '_onChildAdded', node.toString() );
		if( !this._noChildStateEvents && this.index + 1 == this.numChildren )
		{
			this.dispatchEvent( { type:'activechildchange', activeChild:node } );
			if( node )
			{
				node.activated();
			}
		}
		
		base._onChildAdded.call( this, node, index );
	}
	
	this._onChildRemoved = function( node, index ){
		//console.log( '_onChildRemoved', node.toString() );
		if( index == this.numChildren )
		{
			if( !this._noChildStateEvents )
			{
				var activeChild = this.activeChild();
				
				this.dispatchEvent( { type:'activechildchange', activeChild:activeChild } );
				node.deactivated();
				
				if( activeChild )
				{
					activeChild.activated();
				}
			}
		}
		
		base._onChildRemoved.call( this, node, index );
	}
	
	this._onChildrenRearranged = function( node1, node2, index1, index2 ){
		var numChildren = this.numChildren;
		
		if( index1+1 == numChildren || index2+1 == numChildren )
		{
			if( !this._noChildStateEvents )
			{
				this.dispatchEvent( { type:'activechildchange', activeChild:this.activeChild() } );
			}
		}
		
		base._onChildrenRearranged.call( this, node1, node2, index1, index2 );
	}
}