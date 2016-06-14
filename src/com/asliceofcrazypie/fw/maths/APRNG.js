//#import com.asliceofcrazypie.fw.Base
 
//#class com.asliceofcrazypie.fw.maths.APRNG extends com.asliceofcrazypie.fw.Base
function( base ){
	this.constructor = function(){
		base.constructor.call( this );
	}
	
	/**
	 * provides the next pseudorandom number
	 * as an unsigned integer (31 bits)
	 */
	this.nextInt = function ()
	{
		//to be overidden
		throw new Error( 'nextInt method should be overridden' );
	}
	
	/**
	 * provides the next pseudorandom number
	 * as a float between nearly 0 and nearly 1.0.
	 */
	this.nextDouble = function ()
	{
		return (this.nextInt() / 2147483647);
	}
	
	/**
	 * provides the next pseudorandom number
	 * as an unsigned integer (31 bits) betweeen
	 * a given range.
	 */
	this.nextIntRange = function (min, max)
	{
		min -= .4999;
		max += .4999;
		return Math.round(min + ((max - min) * this.nextDouble()));
	}
	
	/**
	 * provides the next pseudorandom number
	 * as a float between a given range.
	 */
	this.nextDoubleRange = function (min, max)
	{
		return min + ((max - min) * this.nextDouble());
	}
}