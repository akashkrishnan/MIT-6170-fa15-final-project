'use strict';

var Minilesson = require("../../models/minilesson.js");
var Course = require('../../models/course.js');
var User = require( '../../models/user.js' );

module.exports = function (scope) {
	return function ( done ) {
	  // Make sure minilesson is set up
	  (require( './minilesson.js' )(scope))( function () {

		scope.pageTitle = "Page Title";
		scope.pageResource = "www.flipperSwag.com";

    //Setup: Create User, Course, Minilesson
        
        Course.add({
                name: 'courseName10',
                teacher_id: scope.teacher._id
            }, function (err, _course) {
                if (err) {
                    throw err;
                }
                scope.course = _course;
                Minilesson.add({
                    user_id: scope.teacher._id,
                    course_id: String(scope.course._id),
                    due_date: scope.nextMonth,
                    title: 'Title'
                }, function (err, _minilesson) {
                    if (err) {
                        throw err;
                    }
                    scope.minilesson = _minilesson;
                    scope.pageData = {
                        user_id: String(scope.teacher._id),
                        minilesson_id: String(scope.minilesson._id),
                        title: scope.pageTitle,
                        resource: scope.pageResource
                    };
                    done();
                });
            });

	  } );

	};
}
