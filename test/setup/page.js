'use strict';

module.exports = function ( done ) {

  // Make sure minilesson is set up
  require( './minilesson.js' )( function () {

    // do some setup for page.js
    done();

  } );

};
