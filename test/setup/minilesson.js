'use strict';

var Course = require('../models/course.js');
var User = require( '../models/user.js' );

module.exports = function ( done ) {

  // Make sure course is set up
  require( './course.js' )( function () {
  	
  	var teacher = User.get({
  		username: "harinisuresh",
  		paswords: "HaRiNi999!"
  	}, function (err, _user) {
            if (err) {
                throw err;
            }

            Course.add({
		  		name: "Intro to AP Physics",
		  		teacher_id: teacher._id
		  	}, function (err, _course) {
		  		if (err) {
		  			throw err;
		  		}
		  		course = _course;
		  	});
            user = _user;
            });
  	);

    done();

  } );

};
