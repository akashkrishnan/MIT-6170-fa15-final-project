'use strict';

module.exports = function ( done ) {

  // Make sure course is set up
  require( './course.js' )( function () {

    // do some setup for minilesson.js
    done();

  } );

};
