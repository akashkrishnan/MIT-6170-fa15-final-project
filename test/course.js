'use strict';

var Course = require( '../models/course.js' );
var User = require('../models/user.js');
var assert = require( 'assert' );


describe( 'Courses', function () {
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

  // add some users
  before( function (done) {
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
  });


  // add a course
  describe( '#add()', function () {
    it( 'adds a new course', function ( done ) {
      Course.add( {name: 'Biology', teacher_id: teacher._id}, function ( err, course ) {
        testCourse = course; 
        assert.equal( course.name, 'Biology' );
        assert.equal( course.teachers.length, 1);
        assert.equal( course.teachers[0]._id, teacher._id)
        done();
      } );
    } );

    it( 'rejects course with same name', function ( done ) {
      Course.add( { name: 'Biology', teacher_id: teacher._id }, function ( err, course ) {
        assert.notEqual( err, null );
        assert.equal( course, null );
        done();
      }
      );
    } );
  } );


  // exists
  describe( '#exists()', function () {
    it( 'checks if a course exists', function ( done ) {
      Course.exists( { name: 'Biology' }, function ( err, exists, courseId ) {
        assert.equal( exists, true );
        done();
      } );
    } );
  } );


  // get
  describe( '#get()', function () {
    it( 'gets a course by name', function ( done ) {
      Course.get( { name: 'Biology' }, function ( err, course ) {
        assert.equal( course.name, 'Biology' );
        done();
      } );
    } );

    it( 'gets a course by teacher', function ( done ) {
      var criteria = { teacher_id: teacher._id };
      Course.get( criteria, function ( err, course ) {
        console.log(err);
        assert.equal( course.name, 'Biology' );
        done();
      } );
    } );

  } );


  // adding a student to course
  describe( '#join()', function () {
    it( 'adds a pending student', function ( done ) {
      Course.join( { _id: testCourse._id, student_id: student._id }, function ( err, course ) {
        Course.get( { _id: course._id }, function ( err, updatedCourse ) {
          assert.equal( updatedCourse.name, 'Biology' );
          assert.equal( updatedCourse.pendingStudents.length, 1);
          assert.equal( updatedCourse.pendingStudents[0]._id, student._id);
          done();
        } );
      } );
    } );
  } );


  // accept student
  describe( '#acceptStudent()', function () {
    it( 'does not accept a non-pending student', function ( done ) {      
      Course.acceptStudent( { _id: testCourse._id, teacher_id: teacher._id, student_id: student2._id }, function ( err, course ) {
        assert.equal( course, null );
        done();
      } );
    } );

    it( 'does not allow someone who is not the teacher to accept student', function ( done ) {      
      Course.acceptStudent( { _id: testCourse._id, teacher_id: student2._id, student_id: student2._id }, function ( err, course ) {
        assert.equal( course, null );
        done();
      } );
    } );

    it( 'accepts a student into a class', function ( done ) {
      Course.acceptStudent( { _id: testCourse._id, teacher_id: teacher._id, student_id: student._id }, function ( err, course ) {
        Course.get( { _id: course._id }, function ( err, updatedCourse ) {
          assert.equal( updatedCourse.name, 'Biology' );
          assert.equal( updatedCourse.pendingStudents.length, 0);
          assert.equal( updatedCourse.students.length, 1);
          assert.equal( updatedCourse.students[0]._id, student._id);
          done();
        } );
      } );
    } );
  } );


  // decline student
  describe( '#declineStudent()', function () {

    it( 'declines a student from joining a class', function ( done ) {
      Course.join( { _id: testCourse._id, student_id: student2._id }, function ( err, course ) {
        Course.declineStudent( { _id: testCourse._id, teacher_id: teacher._id, student_id: student2._id }, function ( err, course ) {
          Course.get( { _id: testCourse._id }, function ( err, updatedCourse ) {
            assert.equal( updatedCourse.pendingStudents.length, 0);
            assert.equal( updatedCourse.students.length, 1);
            assert.notEqual( updatedCourse.students[0]._id, student2._id);
            done();
          } );
        } );
      } );
    } );

  } );

} );
