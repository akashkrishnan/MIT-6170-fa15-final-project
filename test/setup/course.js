'use strict';

module.exports = function ( done ) {

  // Make sure user is set up
  require( './user.js' )( function () {

    // do some setup for course.js
    done();

  } );

};
