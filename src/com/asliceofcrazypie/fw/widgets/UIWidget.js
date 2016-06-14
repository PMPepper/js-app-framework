/*Base class for widgets which involve UI interaction (mouse, touch, keyboard etc)*/

//#require libs.jquery.mousewheel-3_0_6

//#import com.asliceofcrazypie.fw.widgets.Widget
//#import com.asliceofcrazypie.fw.ui.InteractionPoint
//#import com.asliceofcrazypie.fw.ui.Interaction

//#class com.asliceofcrazypie.fw.widgets.UIWidget extends com.asliceofcrazypie.fw.widgets.Widget
function( base ){
	var DEFAULT_BLOCK = '__default__';
	
	var INTERACTION_START_EVENTS = ['mousedown', 'touchstart'];
	var INTERACTION_MOVE_EVENTS = ['drag', 'mousemove', 'touchmove'];
	var INTERACTION_END_EVENTS = ['mouseup', 'touchend'];//, 'touchcancel', 'dragend', 'touchleave'
	var INTERACTION_TAP_EVENTS = ['click', 'tap'];
	var INTERACTION_MOUSE = 'mouse';
	var INTERACTION_TOUCH = 'touch';
	var INTERACTION_KEY = 'key';
	var INTERACTION_UNKNOWN = 'unknown';
	var INTERACTION_CANCELLED = 'cancelled';
	
	var PHASE_START = 'start';
	var PHASE_ONGOING = 'ongoing';
	var PHASE_END = 'end';
	var PHASE_TAP = 'tap';
	
	var GESTURE_DRAG = 'drag';
	var GESTURE_TRANSFORM = 'transform';
	var GESTURE_SWIPE = 'swipe';
	var GESTURE_CANCELLED = 'cancelled';
	
	var $window = $(window);//['body',window, document]
	
	this.constructor = function( element, options ){
		base.constructor.call( this, element, options );
		
		element = this.element;
		options = this.options;
		var target = this._target = options.target || element;
		
		this._blocks = {};
		this._isBlocked = false;

		if( options.initBlocked )
		{
			this.set_block( true );
		}
		
		//set event handlers
		var movement = this._movement = options.transform || options.drag || options.swipe || options.hold;
		var click = this._click = options.tap || options.hold || options.tap_long || options.tap_double;
		
		if( click || movement )
		{
			this.on( INTERACTION_START_EVENTS, interactionStart.bind( this ), target );
			
			this._interactionEndProxy = interactionEnd.bind( this );
			this._interactionTapProxy = interactionTap.bind( this );
			this._endTarget = $window;//$window.add( target );
			
			this._movementProxy = interactionMove.bind( this );
		}
		
		if( movement )
		{
			this.on( 'dragstart', prevent, target );
			
			//set preventDefault options, unless specified otherwise
			if( typeof( options.preventDefaultEvents.mousedown ) == 'undefined' )
			{
				options.preventDefaultEvents.mousedown = true;
			}
			
			if( typeof( options.preventDefaultEvents.mousemove ) == 'undefined' )
			{
				options.preventDefaultEvents.mousemove = true;
			}
			
			if( typeof( options.preventDefaultEvents.touchmove ) == 'undefined' )
			{
				options.preventDefaultEvents.touchmove = true;
			}
		}
		
		if( options.mousewheel )
		{
			if( target.mousewheel )
			{
				target.mousewheel( interactionWheel.bind( this ) );
			}
			else
			{
				NC.log( 'cannot use mousewheel event, jquery mousewheel library required' );
			}
		}
		
		if( options.momentum )
		{
			this._momentumSamples = [];
		}
		
		if( options.preventUserSelect )
		{
			this.on( 'selectstart', prevent, target );
			target.css( { 'user-select':'none', '-webkit-user-select':'none', '-moz-user-select':'none' } )
		}
	}
	
	Self._defaultOptions = {
		mousewheel              : false,//TODO
		
		transform               : false,
		scale_threshold         : 0.1,
		rotation_threshold      : 15, // degrees

		drag                    : false,
		drag_min_distance       : 20,
		drag_direction          : 'any',//any|horizontal|vertical

		swipe                   : false,
		swipe_time              : 200,   // ms
		swipe_min_distance      : 20, // pixels
		swipe_direction         : 'any',//any|horizontal|vertical|up|down|left|right
		
		momentum                : false,
		momentum_samples        : 10,
		//momentum_min_distance   : 20, // pixels
		momentum_min_speed      : 200, // pixels/second

		tap                     : false,
		tap_double              : false,
		tap_long                : false,
		tap_max_interval        : 300,
		tap_max_distance        : 10,
		tap_double_distance     : 20,

		hold                    : false,
		hold_timeout            : 500,

		preventDefaultEvents    : {},
		
		focusOnInteraction      : true,
		
		useFastClick            : true,
		
		
		preventDoubleTapZoom    : false,
		preventUserSelect    : false
	};
	
	
	//Touch events order:
	//Spec?             touchstart, touchend, mouseover, mousemove, mousedown, mouseup, click
	//Galaxy S3:        mousemove, touchstart, touchend, mousedown, mouseup, click
	//iPad:             touchstart, touchend, mousemove, mousedown, mouseup, click
	//Chrome emulation: touchstart, mousedown, [touchmove, mousemove,] touchend, mouseup, click
	
	/*event handlers start*/
	function interactionWheel( evt, delta, deltaX, deltaY )
	{
		if( !this._callHandler( 'onMousewheel', new NC.Geom.Vector( deltaX, deltaY ) ) )
		{
			prevent(evt);
			
			return false;
		}
	}
	
	function interactionStart( evt )
	{
		var interactionType = getInteractionType( evt );
		var doAddListeners = true;
		
		var options = this.options,
			target = this._target;
		
		if( interactionType == INTERACTION_MOUSE && this._doIgnoreMouseDown )
		{
			this._doIgnoreMouseDown = false;
			return;//stop!
		}
		
		if( !this._interactionType )
		{
			this._interactionType = interactionType;
			
			if( interactionType == INTERACTION_TOUCH ){
				this._doIgnoreMouseDown = true;
				
				if( options.preventDoubleTapZoom )
				{
					var metaTag = $( 'meta[name=viewport]' );
					this._meta = metaTag.attr( 'content' )
					metaTag.attr( 'content', 'user-scale=no' );
				}
			}
		}
		else
		{
			if( this._interactionType == interactionType && interactionType == INTERACTION_TOUCH ){
				//this is a subsequent touch
				doAddListeners = false;
			}
			else
			{
				return;//ignore legacy mouse events fired by touch
			}
		}
		
		var interaction = new NC.UI.Interaction( evt, PHASE_START );
		
		this._startInteraction = this._moveInteraction = interaction;
		this._endGesture( interaction, evt );
		this._firstInteraction = true;
		this._travelledDistance = 0;
		
		this._updateFingersCount(evt);
		
		
		if( !this._callHandler( 'onPress', interaction ) )
		{
			prevent(evt);
			this._interactionType = INTERACTION_CANCELLED;
			return false;
		}
		
		if( doAddListeners )
		{
			if( options.momentum )
			{
				this._momentumSamples.length = 0;
			}
			
			//listen to move events
			this.on( INTERACTION_MOVE_EVENTS, this._movementProxy, this._endTarget );
			
			//listen to up events
			this.on( INTERACTION_END_EVENTS, this._interactionEndProxy, this._endTarget );
			this.on( INTERACTION_TAP_EVENTS, this._interactionTapProxy, target );
		}
		
		if( options.focusOnInteraction )
		{
			target.focus();
		}
		
		if( options.hold )
		{
			this._holdId = setTimeout( interactionHold.bind( this ), options.hold_timeout );
		}
		
		this._checkPreventDefault( evt );
	}
	
	function interactionHold()
	{
		if( this._interactionType != INTERACTION_CANCELLED || this._gesture )
		{
			var options = this.options;
			
			if( this._travelledDistance < options.tap_max_distance )
			{
				if( !this._callHandler( 'onHold', this._startInteraction ) )
				{
					this._interactionType = INTERACTION_CANCELLED;
					return false;
				}
			}
		}
	}
	
	function interactionMove( evt )
	{
		if( this._interactionType == INTERACTION_CANCELLED )
		{
			prevent(evt);
			return false;
		}
		
		if( evt.type == 'touchmove' )
		{
			this._doIgnoreMouseDown = false;
		}
		
		//TODO keep track of interactions (for throws, etc?)
		this._updateFingersCount(evt);
		
		var interaction = new NC.UI.Interaction( evt, PHASE_ONGOING );
		
		this._updateMomentum( interaction );
		
		//keep track for distance travelled
		if( this._click )
		{
			this._travelledDistance += interaction.points[0].distance( this._moveInteraction.points[0] );
		}
		
		this._moveInteraction = interaction;
		//first, decide if this is a drag or a transform
		if( !this._isTransform( interaction ) ){
			this._isDrag( interaction );
		}
		
		this._checkPreventDefault( evt );
	}
	
	function interactionEnd( evt )
	{
		this._stopHold();
		var options = this.options;
		
		if( options.preventDoubleTapZoom && this._interactionType == INTERACTION_TOUCH && this._meta )
		{
			var metaTag = $( 'meta[name=viewport]' );
			metaTag.attr( 'content', this._meta );
			delete this._meta;
		}
		
		if( this._interactionType == INTERACTION_CANCELLED || this._interactionType == ''  )
		{
			this._interactionType = '';
			prevent(evt);
			return false;
		}
		
		this._updateFingersCount(evt);
		
		//-clear the event handlers
		this.off( INTERACTION_MOVE_EVENTS, this._movementProxy, this._endTarget );
		this.off( INTERACTION_END_EVENTS, this._interactionEndProxy, this._endTarget );
		
		if( this.interactionType == INTERACTION_TOUCH )
		{
			if( this._doIgnoreMouseDown ){
				
				ignoreNext( options.target, 'mousedown' );
			}
		}
		
		//clear the interaction type
		var interactionType = this._interactionType;
		this._interactionType = '';
		
		//get the interaction
		var interaction = new NC.UI.Interaction( evt, PHASE_END );
		
		//end the gesture
		if( !this._endGesture( interaction, evt ) )
		{
			prevent(evt);
			return false;
		}
		
		if( !this._callHandler( 'onRelease', interaction ) )
		{
			prevent(evt);
			return false;
		}
		
		this._checkPreventDefault( evt );
		
		//TODO make work with double tap?
		if( options.useFastClick && evt.type == 'touchend' && interactionType == INTERACTION_TOUCH && this._fingersCount == 0 )
		{
			this._interactionTapProxy( evt, true );
			evt.preventDefault();
		}
		
		if( ! this._isSwipe( interaction ) || !this._isMomentum( interaction ) )
		{
			prevent(evt);
			return false;
		}
	}
	
	function interactionTap(evt, isFastClick)
	{
		var options = this.options;
		this.off( INTERACTION_TAP_EVENTS, this._interactionTapProxy, options.target );
		this._stopHold();
		
		if( this._interactionType == INTERACTION_CANCELLED || this._gesture ){
			prevent( evt);
			return false;
		}
		
		this._updateFingersCount(evt);
		
		var interaction = new NC.UI.Interaction( evt, PHASE_END );
		var start = this._startInteraction;
		
		
		if( this._travelledDistance >= options.tap_max_distance )
		{
			return;//ignore taps that have exceeded the maximum distance
		}
		
		var touchTime = interaction.time.getTime() - start.time.getTime();
		
		// dont fire when hold is fired
		if(options.tap_long && !(options.tap_long && options.hold_timeout > touchTime)) {
			if( !this._callHandler( 'onLongTap', interaction, start ) )
			{
				prevent(evt);
				return false;
			}
		}
		else
		{
			//not a long tap
			var isDoubleTap = false;
			var prevTap = this._prevTap;
			
			if( options.tap_double && prevTap )
			{
				var tapInterval = interaction.time.getTime() - prevTap.time.getTime();
				
				if( tapInterval < options.tap_max_interval )
				{
					var distance2 = interaction.points[0].distance( prevTap.points[0], true );
					
					isDoubleTap = distance2 < ( options.tap_double_distance * options.tap_double_distance )
				}
			}
			
			if( isDoubleTap )
			{
				if( !this._callHandler( 'onDoubleTap', interaction, start, prevTap ) )
				{
					prevent(evt);
					return false;
				}
			}
			else//is single tap
			{
				if( !this._callHandler( 'onTap', interaction, start, prevTap ) )
				{
					prevent(evt);
					return false;
				}
			}
			
			//finally, do tidy up
			if( options.tap_double )
			{
				//finally record this tap as the previous tap so a double tap can be detected
				this._prevTap = interaction;
			}
		}
		
		
		this._checkPreventDefault( evt, 'click' );
		
		
		if( isFastClick && !evt.isDefaultPrevented() )
		{
			//NC.log( 'click it!' );
			$( evt.target ).click();
		}
		
	}
	/*event handlers end*/
	
	/* start private event function */
	this._stopHold = function()
	{
		try{
			if( this._holdId )
			{

				clearTimeout( this._holdId );
				this._holdId = null;
			}
		}
		catch(e){
			NC.log( e.toString() );
		}
	}
	
	this._updateFingersCount = function(evt)
	{
		evt = evt.originalEvent || evt;
		
		if( evt.touches )
		{
			this._fingersCount = evt.touches.length;
		}
	}
	
	this._endGesture = function( interaction, evt ){
		var gesture = this._gesture;
		this._firstInteraction = true;
		this._gesture = '';
		
		switch( gesture )
		{
			case GESTURE_DRAG:
				if( !this._callHandler( 'onDragEnd', interaction, this._startInteraction ) )
				{
					prevent(evt);
					return false;
				}
				break;
			case GESTURE_TRANSFORM:
				if( !this._callHandler( 'onTransformEnd', interaction, this._startInteraction ) )
				{
					prevent(evt);
					return false;
				}
				break;
			case GESTURE_SWIPE:
				//TODO swipe???
				break;
		}
		
		return true;
	}
	
	this._updateMomentum = function( interaction )
	{
		var options = this.options;
		
		if( options.momentum )
		{
			var samples = this._momentumSamples;
			samples.push( interaction );
			
			if( samples.length > options.momentum_samples )
			{
				samples.shift();//remove oldest sample
			}
		}
	}
	
	/*type = override type*/
	this._checkPreventDefault = function( evt, type )
	{
		type = type || evt.type;
		
		if( this.options.preventDefaultEvents[type] === true )
		{
			evt.preventDefault();
		}
	}
	
	this._callHandler = function( name )
	{
		var handler = this['_'+name];
		var args = Array.prototype.slice.call(arguments, 1);
		
		if( handler instanceof Function )
		{
			return handler.apply( this, args ) !== false;
		}
		
		return true;
	}
	/* end private event function */
	
	//TODO gestures (tap, transform, swipe, drag, etc)
	/*Gestures start*/
	this._isMomentum = function( interaction )
	{
		var options = this.options;
		var start = this._startInteraction;
		var samples = this._momentumSamples;
		
		if(!options.momentum || start == interaction || this._momentumSamples.length < options.momentum_samples) {
			return true;
		}
		
		//now get average vector across samples
		var from, to, time, vector = new NC.Geom.Vector(), totalVector = new NC.Geom.Vector();
		//console.log( samples )
		//for( var i = 1; i < samples.length; i++ )
		//{
			from = samples[0];
			to = interaction;//samples[samples.length-1];
			
			time = ( to.time.getTime() - from.time.getTime() ) /1000;
			
			//calculate vector
			to.points[0].subtract( from.points[0], vector );
			
			vector.multiply( 1 / time, vector );//convert to pixels/second
			totalVector.add( vector, totalVector );//add to total vector
		//}
		
		if( totalVector.get_length() > options.momentum_min_speed )
		{
			if( !this._callHandler( 'onMomentum', interaction, totalVector ) )
			{
				prevent(interaction.event);
				this._gesture = GESTURE_CANCELLED;
				return false;
			}
		}
		
		return true
	}
	
	this._isSwipe = function( interaction )
	{
		var options = this.options;
		var start = this._startInteraction;
		
		if(!options.swipe || start == interaction) {
			return true;
		}

		// get the distance we moved
		var distanceX = interaction.points[0].x - start.points[0].x;
		var distanceY = interaction.points[0].y - start.points[0].y;
		var distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
		
		// compare the kind of gesture by time
		var now = new Date().getTime();
		var touchTime = now - start.time.getTime();

		if(options.swipe && (options.swipe_time > touchTime) && (distance > options.swipe_min_distance)) {
			// calculate the angle
			var angle = interaction.points[0].angle( start.points[0] );//this._draggable_getAngle(start.points[0], interaction.points[0]);
			var direction = getDirectionFromAngle(angle);
			
			
			if( options.swipe_direction == 'any' || options.swipe_direction == direction || ( options.swipe_direction == 'horizontal' && ( direction == 'left' || direction == 'right' ) ) || ( options.swipe_direction == 'vertical' && ( direction == 'up' || direction == 'down' ) ) )
			{
				// normal slide event
				if( !this._callHandler( 'onSwipe', interaction, direction, distance, angle, distanceX, distanceY ) )
				{
					prevent(interaction.event);
					this._gesture = GESTURE_CANCELLED;
					return false;
				}
			}
		}
		
		return true;
	}
	
	this._isTransform = function( interaction )
	{
		var options = this.options,
			target = this._target;
		
		if( options.transform )
		{
			if(interaction.size() != 2) {
				return false;
			}
			var start = this._startInteraction;
			
			var rotation = calculateRotation( start, interaction );
			var scale = calculateScale( start, interaction );
			
			if( this._gesture == GESTURE_TRANSFORM || Math.abs(1-scale) > options.scale_threshold || Math.abs(rotation) > options.rotation_threshold ) {
				
				this._gesture = GESTURE_TRANSFORM;

				this._interactionCenter = new NC.UI.InteractionPoint( (interaction.points[0].x + interaction.points[1].x) / 2, (interaction.points[0].y + interaction.points[1].y) / 2, this.element, this.element, new Date() );

				// on the first time trigger the start event
				if(this._firstInteraction)
				{
					if( !this._callHandler( 'onTransformStart', this._interactionCenter, scale, rotation, start, interaction ) )
					{
						prevent(interaction.event);
						this._gesture = GESTURE_CANCELLED;
						return false;
					}

					this._firstInteraction = false;
				}

				//trigger the transforming event
				if( !this._callHandler( 'onTransforming', this._interactionCenter, scale, rotation, start, interaction ) )
				{
					prevent(interaction.event);
					this._gesture = GESTURE_CANCELLED;
					return false;
				}
				
				return true;
			}
		}

		return false;
	}
	
	this._isDrag = function(interaction){
		var options = this.options,
			target = this._target;
		
		if( options.drag )
		{
			
			var start = this._startInteraction;
			var distanceX = interaction.points[0].x - start.points[0].x;
			var distanceY = interaction.points[0].y - start.points[0].y;
			var distance2 = distanceX*distanceX + distanceY*distanceY;
			
			if( distance2 > ( options.drag_min_distance * options.drag_min_distance ) || this._gesture == GESTURE_DRAG )
			{
				if( this._firstInteraction )
				{
					switch( options.drag_direction ){//enforce direction
						case 'horizontal':
							if( Math.abs( distanceX ) <= Math.abs( distanceY ) )
							{
								this._gesture = GESTURE_CANCELLED;
								return;
							}
							break;
						case 'vertical':
							if( Math.abs( distanceX ) >= Math.abs( distanceY ) )
							{
								this._gesture = GESTURE_CANCELLED;
								return;
							}
							break;
						default:
					}
					
					this._firstInteraction = false;
					this._gesture = GESTURE_DRAG;
					
					if( !this._callHandler( 'onDragStart', interaction, start ) )
					{
						prevent(evt);
						this._gesture = GESTURE_CANCELLED;
						return false;
					}
				}//end if first interaction
				
				if( !this._callHandler( 'onDragging', interaction, start ) )
				{
					prevent(evt);
					this._gesture = GESTURE_CANCELLED;
					return false;
				}
			}//end if drag
		}
	}
	
	//TODO disable/block input (both mouse and keyboard) + optional element (support nesting, etc)
	this.set_block = function( value, name ){
		name = name || DEFAULT_BLOCK;

		value = !!value;

		if( this._blocks[name] != value )
		{
			this._blocks[name] = value;
			this._updateBlock();
		}
	}

	var STORE_TAB_INDEX = 'data-originalTabindex';

	this._updateBlock = function(){
		if( this.get_block() != this._isBlocked )
		{
			//things need to change!
			this._isBlocked = !this._isBlocked;
			var element = this.element, i;

			if( this._isBlocked )
			{
				//make things blocked
				//-keyboard
				var keyInput = element.find( 'a, input, button, select, textarea, [tabindex]' );
				var curElement, tabIndex;

				for( i = 0; i < keyInput.length; i++ )
				{
					curElement = $( keyInput[i] );
					tabIndex = curElement.attr( 'tabindex' ) || 0;

					curElement.attr( STORE_TAB_INDEX, tabIndex ).attr( 'tabindex', '-1' );
				}

				//mouse
				if( this._blockElement )
				{
					this._blockElement.show();
				}
				else
				{
					//TODO legacy block mouse
					if( element.css( 'position' ) == 'static' )
					{
						element.css( 'position', 'relative' );
					}

					this._blockElement = $( '<div />' ).appendTo( element ).css( {position:'absolute', top:0, left:0, bottom:0, right:0, 'z-index':999999999, background:'transparent url(data:image/gif;base64,R0lGODlhAQABAPAAAP) repeat' } );
				}
			}
			else
			{
				//make things unblocked
				//-keyboard
				var keyInput = element.find( '['+STORE_TAB_INDEX+']' );
				var curElement, tabIndex;

				for( i = 0; i < keyInput.length; i++ )
				{
					curElement = $( keyInput[i] );
					tabIndex = curElement.attr( STORE_TAB_INDEX );

					curElement.attr( 'tabindex', tabIndex || 0 ).attr( STORE_TAB_INDEX, null );
				}

				//mouse
				//TODO undo legacy block mouse
				this._blockElement.hide();
			}
		}

	}

	this.get_block = function( name ){
		name = name || DEFAULT_BLOCK;

		if( name == DEFAULT_BLOCK )
		{
			var blocks = this._blocks;

			for( var block in blocks )
			{
				if( blocks[block] )
				{
					return true;
				}
			}

			return false;
		}
		else
		{
			return !!this._blocks[name];
		}
	}
	
	//private static functions
	function prevent(evt){
		if( evt ){
			evt.preventDefault();
			evt.stopImmediatePropagation();
		}
		
		return false;
	}
	
	function ignoreNext( element, event )
	{
		$(element).on( event, function(evt){
			evt.preventDefault();
			evt.stopImmediatePropagation();
			$(element).off( event, ignoreNext );
			return false;
		});
	}
	
	function getInteractionType(evt){
		switch( evt.type ){
			case 'touchstart':
				return INTERACTION_TOUCH;
			case 'mousedown':
			case 'mouseclick':
				return INTERACTION_MOUSE;
			default:
				return INTERACTION_UNKNOWN;
		}
	}
	
	function getDirectionFromAngle( angle ) {
		var qp = Math.PI * 0.25;
		var tqp = Math.PI * 0.75;
		
		var directions = {
			down: angle >= qp && angle < tqp, //90
			left: angle >= tqp || angle <= -tqp, //180
			up: angle < -qp && angle > -tqp, //270
			right: angle >= -qp && angle <= qp //0
		};
		
		var direction, key;
		for(key in directions){
			if(directions[key]){
				direction = key;
				break;
			}
		}
		return direction;
	}
	
	function calculateScale(startInteraction, currentInteraction)
	{
		if(startInteraction.size() == 2 && currentInteraction.size() == 2)
		{
			var x, y;

			x = startInteraction.points[0].x - startInteraction.points[1].x;
			y = startInteraction.points[0].y - startInteraction.points[1].y;
			var start_distance = Math.sqrt((x*x) + (y*y));

			x = currentInteraction.points[0].x - currentInteraction.points[1].x;
			y = currentInteraction.points[0].y - currentInteraction.points[1].y;
			var end_distance = Math.sqrt((x*x) + (y*y));

			return end_distance / start_distance;
		}

		return 0;
	}
	
	function calculateRotation(startInteraction, currentInteraction)
	{
		if(startInteraction.size() == 2 && currentInteraction.size() == 2)
		{
			var x, y;

			x = startInteraction.points[0].x - startInteraction.points[1].x;
			y = startInteraction.points[0].y - startInteraction.points[1].y;
			var start_rotation = Math.atan2(y, x);

			x = currentInteraction.points[0].x - currentInteraction.points[1].x;
			y = currentInteraction.points[0].y - currentInteraction.points[1].y;
			var end_rotation = Math.atan2(y, x);

			return end_rotation - start_rotation;
		}

		return 0;
	}
}