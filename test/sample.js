/**
 * Created by akashkrishnan on 17-Nov-15.
 * Last modified by akashkrishnan on 17-Nov-15 17:17.
 */

'use strict';

var assert = require( 'assert' );

describe( 'Array', function () {
  describe( '#indexOf()', function () {
    it( 'should return -1 when the value is not present', function () {
      assert.equal( -1, [ 1, 2, 3 ].indexOf( 5 ) );
      assert.equal( -1, [ 1, 2, 3 ].indexOf( 0 ) );
    } );
  } );
} );
