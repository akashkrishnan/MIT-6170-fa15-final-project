'use strict';

var MCQ = require( '../models/mcq.js' );
var User = require("../models/user.js");
var Minilesson = require("../models/minilesson.js");
var Page = require("../models/page.js");
var Course = require("../models/course.js");
var Submission = require("../models/submission.js");

var assert = require( 'assert' );

var pageTitle = "Page Title";
var pageResource = "www.flipperSwag.com";
var userTeacher;
var userStudent;
var userOther;
var course;
var minilessonYesterday;
var minilessonMonth;
var pageYesterday;
var pageMonth;
var question = "What is the difference between a hot tub and jacuzzi?";
var emptyString = "";
var oneChoiceList = ["nothing"];
var manyChoiceList = ["size", "everything", "nothing"];
var emptyList =[];
var answer = "nothing";

var mcqYesterday;
var mcqMonth;
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
var nextMonth = new Date();
nextMonth.setDate(nextMonth.getDate() + 30);

var mcqData;
var submissionData;

describe( "Submissions", function () {
      /* Setup: created User (teacher), Course, 
    MiniLesson, Page, MCQ (x2, due yesterday and next month)
    create Student, joined course, accepted student

    */

  before(function (done) {
        

      User.add({
          name: 'Tiffany',
          username: 'tcwong1',
          password: 'username15MIT!'
      }, function (err, _userTeacher) {
          if (err) {
              throw err;
          }
          userTeacher = _userTeacher;
          Course.add({
              name: 'Physics',
              teacher_id: userTeacher._id
          }, function (err, _course) {
              if (err) {
                  throw err;
              }
              course = _course;
              Minilesson.add({
                  user_id: userTeacher._id,
                  course_id: String(course._id),
                  due_date: yesterday,
                  title: 'Due Yesterday'
              }, function (err, _minilessonYesterday) {
                  if (err) {
                      throw err;
                  }
                  minilessonYesterday = _minilessonYesterday;
                  Minilesson.add( {
                    user_id: userTeacher._id,
                    course_id: String(course._id),
                    due_date: nextMonth,
                    title: 'Due Next Month'
                  }, function(err, _minilessonMonth) {
                    if (err) {
                      throw err;
                    }
                    minilessonMonth = _minilessonMonth;
                    Page.add( { // adding pageYesterday
                      user_id: String(userTeacher._id),
                      minilesson_id: String(minilessonYesterday._id),
                      title: pageTitle,
                      resource: pageResource
                    }, function(err, _pageYesterday) {
                      if (err) {
                        throw err;
                      }
                      pageYesterday = _pageYesterday;
                      Page.add( { //adding pageMonth
                        user_id: String(userTeacher._id),
                        minilesson_id: String(minilessonMonth._id),
                        title: pageTitle,
                        resource: pageResource
                      }, function (err, _pageMonth) {
                        if (err) {
                          throw err;
                        }
                        pageMonth = _pageMonth;

                        MCQ.add({
                            user_id: String(userTeacher._id),
                            page_id: String(pageYesterday._id),
                            question: question,
                            answers: manyChoiceList,
                            answer: answer
                          }, function (err, _mcqYesterday) {
                          if (err) {
                            throw err;
                          }
                          mcqYesterday = _mcqYesterday;
                          MCQ.add({
                              user_id: String(userTeacher._id),
                              page_id: String(pageMonth._id),
                              question: question,
                              answers: manyChoiceList,
                              answer: answer
                            }, function(err, _mcqMonth) {
                            if (err) {
                              throw err;
                            }
                            mcqMonth = _mcqMonth;

                            User.add( {
                              name: 'Harini',
                              username: 'hsuresh1',
                              password: 'username15MIT!'
                            }, function (err, _userStudent) {
                              if (err) {
                                throw err;
                              }
                              userStudent = _userStudent;
                              // TODO: check functions
                              Course.join({
                                _id: String(course._id),
                                student_id: String(userStudent._id)
                              }, function(err, _course) {
                                if(err) {
                                  throw err;
                                }
                                Course.acceptStudent({
                                  _id: String(course._id),
                                  teacher_id: String(userTeacher._id),
                                  student_id: String(userStudent._id)
                                }, function(err, _course ) {
                                  if (err) {
                                    throw err;
                                  }
                                  Minilesson.publish({
                                    user_id: String(userTeacher._id),
                                    course_id: String(course._id),
                                    minilesson_id: String(minilessonYesterday._id)
                                  }, function(err) {
                                    if (err) {
                                      throw err;
                                    }
                                    Minilesson.publish({
                                      user_id: String(userTeacher._id),
                                      course_id: String(course._id),
                                      minilesson_id: String(minilessonMonth._id)
                                    }, function(err) {
                                      if (err) {
                                        throw err;
                                      }
                                      User.add({
                                       name: 'akash',
                                        username: 'akashmedrano',
                                        password: 'username15MIT!'
                                      }, function(err, _userOther) {
                                        if (err) {
                                          throw err;
                                        }
                                        userOther = _userOther;
                                        submissionData = {
                                        user_id: String(userStudent._id),
                                        mcq_id: String(mcqMonth._id),
                                        answer: answer
                                        };
                                        done();
                                      
                                      
                                      });
                                  });
                                  });
                                  
                                });
                                
                              });
                              
                            });
                          });
                        });

                      });
                    });
                    
                  });
              });
          });
      });
  });

  describe( '#add()', function () {



    context( 'all valid entries, before due date', function () {
      it( 'should add a submission to the database', function ( done ) {
        Submission.add( submissionData, function ( err ) {
          if ( err ) {
            throw err;
          }
          done();
        } );
      } );
    } );
    context( 'submission after due date', function () {
      it( 'should throw error', function () {
        assert.throws( function () {
          submissionData.mcq_id = String(mcqYesterday._id);
          MCQ.add( mcqData, function ( err ) {
            submissionData.mcq_id = String(mcqMonth._id);
            if ( err ) {
              throw err;
            }
          } );
        }, Error, 'Error Thrown' );
      } );
    } );
    context( 'duplicate subissions', function () {
      it( 'should throw error', function (done) {

            Submission.add(submissionData, function(err) {
              if (err) {
                done();
              } else {
                done(true);
              }
          });
      } );
    } );
    context( 'Teaching trying to answer question', function () {
      it( 'should throw an error', function (done) {
        submissionData.user_id = String(userTeacher._id);
        Submission.add(submissionData, function(err) {
          submissionData.user_id = String(userStudent._id);
          if (err) {
            done();
          } else {
            done(true);
          }
          
        });
      } );
    } );
    context( 'User not associated with mcq', function () {
      it( 'should throw an error', function (done) {
        submissionData.user_id = String(userOther._id);
        Submission.add(submissionData, function(err) {
          submissionData.user_id = String(userStudent._id);
          if (err) {
            done();
          } else {
            done(true);
          }
        });
      } );
    } );
    context( 'provided answer not a valid answer choice', function () {
      it( 'should throw an error', function ( done ) {
        submissionData.answer = "banana";
        Submission.add(submissionData, function(err) {
          submissionData.answer = answer;
          if (err) {
            return done();
          }
          done(true);
        });
      } );
    } );
    context( 'missing answer', function () {
      it( 'should throw an error', function (done) {
        
          delete submissionData.answer;
          Submission.add(submissionData, function ( err ) {
            submissionData.answer = answer;
            if ( err ) {
              return done();
            }
            done(true);
      } );
    } );
  } );
    context( 'missing userID', function () {
      it( 'should throw an error', function (done) {
        
          delete submissionData.user_id;
          Submission.add(submissionData, function ( err ) {
            submissionData.user_id = String(userStudent._id);
            if ( err ) {
              return done();
            }
            done(true);
      } );
    } );
  } );
  describe( '#get()', function () {
    context( 'given valid id', function () {
      it( 'should get the submission from database', function (done) {
        Submission.add( submissionData, function ( err, submission ) {
          if ( err ) {
            return done();
          }
          Submission.get( submission, function ( err, submissionReturned ) {
            if ( err ) {
              return done()
            }
            assert( submissionReturned._id );
          } );
        } );
      } );
    } );
    context( 'given no id property', function () {
      it( 'should throw an error', function (done) {
          Submission.get( {}, function ( err ) {
            if ( err ) {
              return done();
            }
            done(true);
          } );
        });
      } );
    } );
  describe( '#getMCQGrades()', function () {
    context( 'given all valid', function () {
      it( 'should get the submission from database', function (done) {
        Submission.getMCQGrades( submissionData, function ( err, submission ) {
          if ( err ) {
            return done();
          }
          Submission.get( submission, function ( err, submissionReturned ) {
            if ( err ) {
              return done()
            }
            assert( submissionReturned._id );
          } );
        } );
      } );
    } );
    context( 'given no id property', function () {
      it( 'should throw an error', function (done) {
          Submission.getMCQGrades( {}, function ( err ) {
            if ( err ) {
              return done();
            }
            done(true);
          } );
        });
      } );
    } );
  } );
} );
