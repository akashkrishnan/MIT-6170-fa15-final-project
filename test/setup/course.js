'use strict';

module.exports = function ( done ) {

  // Make sure user is set up
  require( './user.js' )( function () {

    var currentCourse = null;

	  var teacherData = {
	    name: 'Harini Suresh',
	    username: 'hsuresh',
	    password: 'HaRiNi999!'
	  }

	  var studentData = {
	    name: 'Tiffany Wong',
	    username: 'tiffanywong',
	    password: 'Tiffany999!'
	  }

	  var studentData2 = {
	    name: 'Alyssa Hacker',
	    username: 'ahack',
	    password: 'Alyssa999!'
	  }

	  var teacher;
	  var student;
	  var student2;
	  var testCourse;
    done();

  } );

};
