/*
 * Copyright (c) 2009 Michael Baczynski, http://www.polygonal.de
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Implementation of the Park Miller (1988) "minimal standard" linear 
 * congruential pseudo-random number generator.
 * 
 * For a full explanation visit: http://www.firstpr.com.au/dsp/rand31/
 * 
 * The generator uses a modulus constant (m) of 2^31 - 1 which is a
 * Mersenne Prime number and a full-period-multiplier of 16807.
 * Output is a 31 bit unsigned integer. The range of values output is
 * 1 to 2,147,483,646 (2^31-1) and the seed must be in this range too.
 * 
 * David G. Carta's optimisation which needs only 32 bit integer math,
 * and no division is actually *slower* in flash (both AS2 & AS3) so
 * it's better to use the double-precision floating point version.
 * 
 * @author Michael Baczynski, www.polygonal.de
 */
 
//#import com.asliceofcrazypie.fw.maths.APRNG
//#import com.asliceofcrazypie.fw.util.NumberUtil
 
//#class com.asliceofcrazypie.fw.maths.ParkMillerPRNG extends com.asliceofcrazypie.fw.maths.APRNG
function( base ){
	/**
	 * set seed with a 31 bit unsigned integer
	 * between 1 and 0X7FFFFFFE inclusive. don't use 0!
	 */
	this.constructor = function( seed ){
		base.constructor.call( this );
		this._seed = 1;
		
		this._addAccessor( 'seed', function(){ return this._seed; }, function( value ){ this._seed = NumberUtil.limit( Math.round( value ), 1, 0x7FFFFFFE ); } );
		
		this.seed = seed;
	}
	
	/**
	 * int generator:
	 * new-value = (old-value * 16807) mod (2^31 - 1)
	 */
	this.nextInt = function ()
	{
		//integer version 1, for max int 2^46 - 1 or larger.
		return this.seed = (this.seed * 16807) % 2147483647;
		
		/**
		 * integer version 2, for max int 2^31 - 1 (slowest)
		 */
		//var test:int = 16807 * (seed % 127773 >> 0) - 2836 * (seed / 127773 >> 0);
		//return seed = (test > 0 ? test : test + 2147483647);
		
		/**
		 * david g. carta's optimisation is 15% slower than integer version 1
		 */
		//var hi:uint = 16807 * (seed >> 16);
		//var lo:uint = 16807 * (seed & 0xFFFF) + ((hi & 0x7FFF) << 16) + (hi >> 15);
		//return seed = (lo > 0x7FFFFFFF ? lo - 0x7FFFFFFF : lo);
	}
	
}