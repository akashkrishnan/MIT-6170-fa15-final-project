'use strict';

var Course = require( '../models/course.js' );
var assert = require( 'assert' );


describe( 'Courses', function () {
	    var currentCourse = null;

	    beforeEach(function (done) {
	    //add some test data
	        Course.add({ 'courseName':'math', 'teacher_id':'1234' }, function (doc) {
	    	    currentCourse = doc;
	    	    done(); });
	});

	    describe('#courseNameExists()', function () {
		    it('checks if a course exists', function (done) {
		        Course.courseNameExists({ 'courseName':'math' }, function (err, exists, courseId) {
			        assert.equal(exists, true);
			        done(); });
	  	});
	});


	    describe('#getCourseByName()', function () {
		    it('gets a course by name', function (done) {
		        Course.getCourseByName({ 'courseName':'math' }, function (err, course) {
			        assert.equal(course.courseName, 'math');
			        assert.deepEqual(course.teachers, [ '1234' ]);
			        done(); });
	  	});
	});


	    describe('#add()', function () {
		    it('adds a new course', function (done) {
	    	    Course.add({ 'courseName':'science', 'teacher_id':'billnye' }, function (err, course) {
			      	    assert.equal(course.courseName, 'science');
			      	    assert.equal(course.teachers, 'billnye');
			      	    done();
	    		}
	      	);
	  	});

		    it('rejects course with same name', function (done) {
	    	    Course.add({ 'courseName':'math', 'teacher_id':'1234' }, function (err, course) {
			      	    assert.notEqual(err, null);
			      	    assert.equal(course, null);
			      	    done();
	    		}
	      	);
	  	});
	});

	    describe('#addStudentToCourse()', function () {
		    it('adds a student', function (done) {
	    	    Course.addStudentToCourse({ 'courseName':'math', 'student':'harini' }, function (err, course) {
			      	    console.log(course);
			      	    done();
	    		}
	      	);
	  	});
	});

	    describe('#getCoursesForTeacher()', function () {
		    it('finds courses taught by a teacher', function (done) {
	    	    Course.getCoursesForTeacher({ 'user_id':'1234' }, function (err, courses) {
			      	    assert.equal(courses[ 0 ].courseName, 'math');
			      	    done();
	    		}
	      	);
	  	});
	});

	    describe('#getCoursesForStudent()', function () {
		    it('finds courses a student is in', function (done) {
	    	    Course.getCoursesForStudent({ 'user_id':'harini' }, function (err, courses) {
			      	    assert.equal(courses[ 0 ].courseName, 'math');
			      	    done();
	    		}
	      	);
	  	});
	});


} );
