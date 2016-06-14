//#import com.asliceofcrazypie.fw.ds.Node

//#class com.asliceofcrazypie.fw.ds.EventNode extends com.asliceofcrazypie.fw.ds.Node
function( base )
{
	this.constructor = function(){
		base.constructor.call( this );
		
		this._bubbleAdded = (function( event, node ){
			var to;
			
			if( event )
			{
				node = event.target;
				to = event.to;
			}
			else
			{
				to = this;
			}
			//console.log( '_bubbleAdded', node );
			this.dispatchEvent( {type:Self.ADDED, target:node, to:to } );
		}).bind( this );
		this._bubbleRemoved = (function( event /*, node*/ ){
			/*var from;
			
			if( event )
			{
				node = event.target;
				from = event.from;
			}
			else
			{
				from = this;
			}*/
			
			this.dispatchEvent( {type:Self.REMOVED, target:event.target/*node*/, from:event.from /*from*/ } );
		}).bind( this );
	}
	
	Self.ADDED = 'added';
	Self.REMOVED = 'removed';
	
	Self.CHILD_ADDED = 'child added';
	Self.CHILD_REMOVED = 'child removed';
	
	this._changeContainer = function( from, to )
	{
		if( this.from != null && this.to != null )
		{
			this.dispatchEvent( { type:Self.REMOVED, from:from } );
			this.dispatchEvent( { type:Self.ADDED, to:to } );
		}
		else if( to == null && from != null )
		{
			this.dispatchEvent( {type:Self.REMOVED, from:from } );
		}
		else if( to != null && from == null ){
			this.dispatchEvent( { type:Self.ADDED, to:to } );
		}
	}
	
	//This will be called AFTER the _changeContainer method is called
	//so need to start bubbling events manually
	this._onChildAdded = function( node, index ){
		this._bubbleAdded( null, node );
		//console.log( '_onChildAdded', this, node );
		this._nodeAddListener = node.addEventListener( Self.ADDED, this._bubbleAdded );
		this._nodeRemovedListener = node.addEventListener( Self.REMOVED, this._bubbleRemoved );
		
		this.dispatchEvent( {type:Self.CHILD_ADDED, node:node } );
	}
	
	//This will be called AFTER the _changeContainer method is called
	//so events will already have started bubbling
	this._onChildRemoved = function( node, index ){
		//console.log( '_onChildRemoved', this, node );
		if(this._nodeAddListener){
			node.removeEventListener( this._nodeAddListener );
			node.removeEventListener( this._nodeRemovedListener );
			this._nodeAddListener = this._nodeRemovedListener = null;
		}
		
		this.dispatchEvent( {type:Self.CHILD_REMOVED, node:node } );
	}
	
}