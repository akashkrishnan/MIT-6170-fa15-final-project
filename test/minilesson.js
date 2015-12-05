/**
 * Created by medra_000 on 11/18/2015.
 */

'use strict';

var User = require('../models/user.js');
var Course = require('../models/course.js');
var Minilesson = require( '../models/minilesson.js' );
var assert = require( 'assert' );

var user;
var course;
var minilesson;
var data;
var minilessonTitle = "Kinematics I";
var minilessonDueDate = new Date();

describe( 'Minnilesson', function () {

  before(function (done) {
    User.add({
      name: 'Person Name',
      username: 'usrname7',
      password: 'username15MIT!'
    }, function (err, _user) {
      if (err) {
        throw err;
      }
      user = _user;
      Course.add({
        name: 'courseName10',
        teacher_id: user._id
      }, function (err, _course) {
        if (err) {
          throw err;
        }
        course = _course;
        data = {
          user_id: user._id,
          course_id: String(course._id),
          due_date: minilessonDueDate,
          title: minilessonTitle
        };
        done();
      });
    });
  });

  describe( '#add()', function () {
    context( 'all valid entries', function () {
      it( 'should add a minilesson to database', function ( done ) {
        Minilesson.add( data, function ( err, _minilesson ) {
          if ( err ) {
            throw err;
          }
          minilesson = _minilesson;
          done();
        } );
      } );
      it( 'should return callback with correct data', function () {
        assert.equal(minilesson.course_id, data.course_id);
        assert.equal(minilesson.title, data.title);
        assert.equal(minilesson.timestamps.due_date, String(data.due_date));
      } );
    } );
  } );

  describe( '#get()', function () {
    it( 'gets a minilesson by _id without error', function ( done ) {
      Minilesson.get( { _id: minilesson._id }, done );
    } );
    it( 'should return minilesson with correct data in callback', function ( done ) {
      Minilesson.get( { _id: minilesson._id }, function ( err, _minilesson ) {
        if ( err ) {
          done( err );
        } else {
          assert.equal( String(_minilesson._id), String(minilesson._id) );
          assert.equal( String(_minilesson.course_id), String(minilesson.course_id) );
          assert.equal( String(_minilesson.title), String(minilesson.title) );
          assert.equal( String(_minilesson.timestamps.due_date), String(minilesson.timestamps.due_date));
          assert.equal( String(_minilesson.states), String(minilesson.states) );
          done();
        }
      } );
    } );
  } );

  describe('#publish', function(){
    it('should change state of minilesson to publish', function(done) {
      done();
    });
  });

  /*
  describe( '#removePage', function () {
    it( 'removes a Page to existing minilesson without error', function ( done ) {
      Minilesson.remove( { _id: minilesson._id, page_id: '0' }, done );
    } );
  } );
  */

} );
