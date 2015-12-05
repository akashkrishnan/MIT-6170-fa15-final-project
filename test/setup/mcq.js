'use strict';

module.exports = function ( done ) {

  // Make sure page is set up
  require( './page.js' )( function () {

    // do some setup for mcq.js
    done();

  } );

};
