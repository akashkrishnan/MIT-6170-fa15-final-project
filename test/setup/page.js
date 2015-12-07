'use strict';

var Minilesson = require("../../models/minilesson.js");
var Course = require('../../models/course.js');
var User = require( '../../models/user.js' );

module.exports = function (scope) {
	return function ( done ) {
	  // Make sure minilesson is set up
	  (require( './minilesson.js' )(scope))( function () {
	  	console.log(scope);
	    // do some setup for page.js
	    done();

	  } );

	};
}
