'use strict';

module.exports = function ( done ) {

  // Make sure mcq is set up
  require( './mcq.js' )( function () {

    // do some setup for submission.js
    done();

  } );

};
