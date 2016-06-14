//#import com.asliceofcrazypie.fw.EventDispatcher

//#class com.asliceofcrazypie.fw.ds.Node extends com.asliceofcrazypie.fw.EventDispatcher
function( base )
{
	this.constructor = function(){
		base.constructor.call( this );
		
		this._addReadOnly( '_children', [] );
		this._container = null;
		
		this._addAccessor( 'container', function() 
			{
				return this._container;
			},
			function(value) 
			{
				if ( value != this._container )//something has changed
				{
					var oldContainer = this._container;
					
					if ( oldContainer != null )
					{
						this._container = null;//set parent to null
						
						//remove from the old container (parent will set parent to null, which will be ignored)
						oldContainer.removeChild( this );
					}
					
					if ( value != null )//if there is a new container
					{
						this._container = value;//record
						
						this._container.addChild( this );//add to container
					}
						
					this._changeContainer( oldContainer, value );
				}
				
				return this._container;
			}
		);
		
		this._addAccessor( 'root', function(){
			var current = this, root = null;
			
			
			while( root = current.container )
			{
				current = root;
			}
			
			return current;
		});//TODO make writeable??
		
		
		this._addAccessor( 'numChildren', function() 
			{
				return this._children.length;
			}
		);
	}
	
	
	
	this.forEachChild = function( callback, thisArg )
	{
		function forEachCallback( value, index ){
			callback.call( this, value, index );
		}
		
		if( typeof( thisArg ) == 'undefined' )
		{
			this._children.forEach( forEachCallback );
		}
		else
		{
			this._children.forEach( forEachCallback, thisArg );
		}
	}
	
	this.forEachDescendant = function( callback, thisArg )
	{
		function forEachCallback( value ){
			callback.call( this, value );
			value.forEachDescendant( callback, thisArg );
		}
		
		if( typeof( thisArg ) == 'undefined' )
		{
			this._children.forEach( forEachCallback );
		}
		else
		{
			this._children.forEach( forEachCallback, thisArg );
		}
	}
	
	//TODO test
	this.forEachAncestor = function( callback, thisArg )
	{
		var node = this;
		
		while( node = this.container )
		{
			thisArg ? callback.call( thisArg, node ) : callback( node );
		}
	}
	
	this.dispose = function() 
	{
		this.container = null;//remove from parent if necessary
		
		var i = 0;
		var node;
		
		while ( ( node = this._children[i++] ) != null )
		{
			node.dispose();//dispose of children as well
		}
		
		this._children = null;
		
		base.dispose.call( this );
	}
	
	//called AFTER the container has been changed
	this._changeContainer = function( from, to )
	{
		//to be overridden
	}
	
	
	
	this.isChild = function(node) 
	{
		if ( node != null )
		{
			for ( var i = 0; i < this._children.length; i++ )
			{
				if ( this._children[i] == node )
				{
					return true;
				}
			}
		}
		
		return false;
	}
	
	this.getChildAt = function( index )
	{
		return this._children[index] || null;
	}
	
	this.getChildIndex = function(node) 
	{
		return this._children.indexOf( node );
	}
	
	this.contains = function(node) 
	{
		if ( node != null )
		{
			var curNode;
			
			for ( var i = 0; i < this._children.length; i++ )
			{
				curNode = this._children[i];
				
				if ( curNode == node )
				{
					return true;
				}
				
				if ( curNode.contains( node ) )
				{
					return true;
				}
			}
		}
		
		return false;
	}
	
	this.addChild = function(node) 
	{
		if ( node != null && !this.contains( node ) )
		{
			this._children.push( node );
			
			node.container = this;
			
			this._onChildAdded( node, this.numChildren - 1 );
			
			return node;
		}
		
		return null;
	}
	
	this._onChildAdded = function( node, index ){
		//to be overridden
	}
	
	
	this.addChildAt = function( node, index ) 
	{
		if ( node != null )
		{
			if ( index > this._children.length )
			{
				throw new Error( "index cannot be greater than the number of children in this container" );
			}
			
			node.container = null;//remove from wherever it currently is
			
			this._children.splice( index, 0, node );
			
			node.container = this;
			
			this._onChildAdded( node, index );
		}
	}
	
	
	this._onChildRemoved = function( node, index ){
		//to be overridden
	}
	
	
	this.removeChild = function( node ) 
	{
		if ( node != null && this.contains( node ) )
		{
			var nodeIndex = this._children.indexOf( node );
			
			this._children.splice( nodeIndex, 1 );
			
			node.container = null;
			
			this._onChildRemoved( node, nodeIndex );
		}
	}
	
	this.removeChildAt = function( index ) 
	{
		if ( index < 0 || index >= this._children.length )
		{
			throw new Error( "Invalid index" );
		}
		
		var node = this._children[index];
		
		this._children.splice( index, 1 );
		
		node.container = null;
		
		this._onChildRemoved( node, index );
	}
	
	this._onChildrenRearranged = function( node1, node2, index1, index2 ){
		//to be overridden
	}
	
	this.swapChildren = function( node1, node2 ) 
	{
		if ( node1 != null && node2 != null && this.contains( node1 ) && this.contains( node2 ) )
		{
			if( node1 != node2 )
			{
				var index1 = this._children.indexOf( node1 );
				var index2 = this._children.indexOf( node2 );
				
				this._children[index1] = node2;
				this._children[index2] = node1;
				
				this._onChildrenRearranged( node1, node2, index1, index2 );
			}
			
			return;
		}
		
		throw new Error( "Both nodes must be non-null and contained within this node" );
	}
	
	this.swapChildrenAt = function( index1, index2 ) 
	{
		if ( index1 < 0 || index1 >= this._children.length || index2 < 0 || index2 >= this._children.length )
		{
			if( index1 != index2 )
			{
				
				var node1 = this._children[index1];
				var node2 = this._children[index2];
				
				this._children[index1] = node2;
				this._children[index2] = node1;
				
				this._onChildrenRearranged( node1, node2, index1, index2 );
			}
			
			return;
		}
		
		throw new Error( "Both index must be non-null and contained within this node" );
	}
}