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
  //   context( 'missing question', function () {
  //     it( 'should throw error', function () {
  //       assert.throws( function () {
  //         delete mcqData.question;
  //         MCQ.add( mcqData, function ( err ) {
  //           mcqData.question = question;
  //           if ( err ) {
  //             throw err;
  //           }
  //         } );
  //       }, Error, 'Error Thrown' );
  //     } );
  //   } );
  //   context( 'empty answerChoicesList ', function () {
  //     it( 'should throw an error', function () {
  //       assert.throws( function () {
  //         mcqData.answers = emptyList ;
  //         MCQ.add( mcqData, function ( err ) {
  //           mcqData.answers = manyChoiceList;
  //           if ( err ) {
  //             throw err;
  //           }
  //         } );
  //       } );
  //     } );
  //   } );
  //   context( 'one choice answerChoicesList ', function () {
  //     it( 'should add mcq to database', function ( done ) {
  //       mcqData.answers = oneChoiceList;
  //       MCQ.add( mcqData, function ( err ) {
  //         mcqData.answers = manyChoiceList;
  //         if ( err ) {
  //           throw err;
  //         }
  //         done();
  //       } );
  //     } );
  //   } );
  //   context( 'missing answerChoicesList', function () {
  //     it( 'should throw an error', function () {
  //       assert.throws( function () {
  //         delete mcqData.answers;
  //         MCQ.add( mcqData, function ( err ) {
  //           mcqData.answers = manyChoiceList;
  //           if ( err ) {
  //             throw err;
  //           }
  //         } );
  //       } );
  //     } );
  //   } );
  // } );
  // describe( '#remove()', function () {
  //   context( 'existing object in db with given id', function () {
  //     it( 'should remove an mcq from database given valid id', function () {
  //       MCQ.add( mcqData, function ( err, mcq ) {
  //         if ( err ) {
  //           throw err;
  //         }
  //         MCQ.remove( mcq, function ( err ) {
  //           if ( err ) {
  //             throw err;
  //           }
  //         } );
  //       } );
  //     } );
  //   } );
  //   context( 'no id property', function () {
  //     it( 'should throw error', function () {
  //       assert.throws( function () {
  //         MCQ.remove( {}, function ( err ) {
  //           if ( err ) {
  //             throw err;
  //           }
  //         } );
  //       } );
  //     } );
  //   } );
  // } );
  // describe( '#get()', function () {
  //   context( 'given valid id', function () {
  //     it( 'should get the mcq from database', function () {
  //       MCQ.add( mcqData, function ( err, mcq ) {
  //         if ( err ) {
  //           throw err;
  //         }
  //         MCQ.get( mcq, function ( err, mcqReturned ) {
  //           if ( err ) {
  //             throw err;
  //           }
  //           assert( mcqReturned._id );
  //         } );
  //       } );
  //     } );
  //   } );
  //   context( 'given no id property', function () {
  //     it( 'should throw an error', function () {
  //       assert.throws( function () {
  //         MCQ.get( {}, function ( err ) {
  //           if ( err ) {
  //             throw err;
  //           }
  //         } );
  //       }, Error, 'Error Thrown' );
  //     } );
  //   } );
  } );
} );
