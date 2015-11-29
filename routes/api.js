/**
 * Created by akashkrishnan on 19-Nov-15.
 * Last modified by akashkrishnan on 19-Nov-15 01:10.
 */

'use strict';

module.exports = function ( app ) {

  require( './api/user.js' )( app );
  require( './api/course.js' )( app );
  require( './api/minilesson.js' )( app );
  require( './api/page.js' )( app );
  require( './api/mcq.js' )( app );
  require( './api/submission.js' )( app );

};
