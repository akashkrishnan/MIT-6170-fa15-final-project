'use strict';

var User = require('../models/user.js');

module.exports = function ( done ) {

  // Make sure user is set up
  require( './user.js' )( function () {

    var currentCourse = null;

	  var teacherData = {
	    name: 'Harini Suresh',
	    username: 'harinisuresh',
	    password: 'HaRiNi999!'
	  }

	  var studentData = {
	    name: 'Tiffany Wong',
	    username: 'tiffanycwong',
	    password: 'Tiffany999!'
	  }

	  var studentData2 = {
	    name: 'Alyssa Hacker',
	    username: 'aahack',
	    password: 'Alyssa999!'
	  }

	  User.add( teacherData, function ( err, _user1 ) {
	      if ( err ) {
	        console.log(err);
	        done( err );
	      } else {
	        teacher = _user1;
	        User.add( studentData, function ( err, _user2 ) {
	          if ( err ) {
	            done ( err );
	          } else {
	            student = _user2;
	            User.add( studentData2, function ( err, _user3 ) {
	              if ( err ) {
	                done ( err );
	              } else {
	                student2 = _user3;
	                done();
	              }
	          } );
	          }
	        } );
	      }
	    } );

    done();

  } );

};
