/**
 * Created by akashkrishnan on 19-Nov-15.
 * Last modified by akashkrishnan on 19-Nov-15 01:10.
 */

'use strict';

var Config = require( '../config.js' );
var Utils = require( '../models/utils.js' );
var Session = require( '../models/session.js' );
var User = require( '../models/user.js' );
var Course = require( '../models/course.js' );
var Minilesson = require( '../models/minilesson.js' );
var Page = require( '../models/page.js' );
var Mcq = require( '../models/mcq.js' );
var Submission = require( '../models/submission.js' );

module.exports = function ( app ) {

  app.get( '/api/user.json', user );

  app.post( '/api/login', apiLogin );
  app.post( '/api/register', apiRegister );
  app.post( '/api/logout', apiLogout );

  app.get( '/api/courses', apiCourseList );
  app.post( '/api/courses', apiCourseAdd );

  app.get( '/api/courses/:course_id', apiCourseGet );
  app.post( '/api/courses/:course_id/join', apiCourseJoin );
  app.get( '/api/courses/:course_id/minilessons', apiMinilessonList );
  app.post( '/api/courses/:course_id/minilessons', apiMinilessonAdd );

  app.get( '/api/minilessons/:minilesson_id', apiMinilessonGet );
  app.get( '/api/minilessons/:minilesson_id/pages', apiPageList );
  app.post( '/api/minilessons/:minilesson_id/pages', apiPageAdd );

  app.get( '/api/pages/:page_id', apiPageGet );
  app.get( '/api/pages/:page_id/mcqs', apiMcqList );
  app.post( '/api/pages/:page_id/mcqs', apiMcqAdd );

  app.get( '/api/mcqs/:mcq_id', apiMcqGet );
  app.get( '/api/mcqs/:mcq_id/submissions', apiSubmissionList );
  app.post( '/api/mcqs/:mcq_id/submissions', apiSubmissionAdd );

  app.get( '/api/mcqs/:mcq_id/grades', apiMCQGrades );

  app.get( '/api/submissions/:submission_id', apiSubmissionGet );

};

/**
 * Called to retrieve current user info.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function user( req, res ) {
  if ( req.user ) {
    res.json( req.user );
  } else {
    res.json( {} );
  }
}

/**
 * Called to authenticate a user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiLogin( req, res ) {

  // Ensure guest (i.e. no user)
  if ( req.user ) {
    res.status( 400 ).json( { err: 'Bad Request: User is already logged in.' } );
  } else {

    // Check if user exists with username and password
    User.get( req.body, Utils.safeFn( function ( err, user ) {
      if ( err ) {
        res.json( { err: 'Invalid Credentials' } );
      } else {

        // Add new session that persists indefinitely until logout
        Session.add( { value: user._id }, Utils.safeFn( function ( err, session ) {

          // Set cookie to be used for future authentication
          res.cookie( Config.web.cookie.name, session._id );

          if ( err ) {
            res.json( { err: err } );
          } else {

            // Update user stating that user has logged in
            User.sign( user, Utils.safeFn( function ( err ) {
              if ( err ) {
                res.json( { err: err } );
              } else {
                res.json( {} );
              }
            } ) );

          }

        } ) );

      }
    } ) );

  }

}

/**
 * Called to register an account.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiRegister( req, res ) {

  // Ensure guest (i.e. no user)
  if ( req.user ) {
    res.status( 400 ).json( { err: 'Bad Request: User must be anonymous to process request.' } );
  } else {

    // Register user by adding
    User.add( req.body, Utils.safeFn( function ( err ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( {} );
      }
    } ) );

  }

}

/**
 * Called to logout any authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiLogout( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Remove session
    Session.remove( { _id: req.apikey }, Utils.safeFn( function ( err ) {
      if ( err ) {
        res.json( { err: err } );
      } else {

        // Remove cookie
        res.clearCookie( Config.web.cookie.name, {} ).json( {} );

      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get a list of Courses objects associated with the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiCourseList( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Get courses the user teaches
    Course.listForTeacher(
      {
        teacher_id: req.user._id,
        projection: {
          students: false,
          timestamps: false,
          states: false
        }
      },
      Utils.safeFn( function ( err, teacherCourses ) {
        if ( err ) {
          res.json( { err: err } );
        } else {

          // Get courses the user takes
          Course.listForStudent(
            {
              student_id: req.user._id,
              projection: {
                students: false,
                timestamps: false,
                states: false
              }
            },
            Utils.safeFn( function ( err, studentCourses ) {
              if ( err ) {
                res.json( { err: err } );
              } else {

                /**
                 * Replaces teacher ids with user objects in courses.
                 *
                 * @param {Array.<Object>} courses - list of Course objects
                 * @param {function()} done - callback
                 */
                var processCourses = function ( courses, done ) {

                  // Loop through courses
                  (function nextCourse( i, n ) {
                    if ( i < n ) {

                      var course = courses[ i ];

                      if ( course.teachers ) {

                        // Loop through teachers
                        (function nextTeacher( j, m ) {
                          if ( j < m ) {

                            // Get User object
                            User.get(
                              {
                                _id: course.teachers[ j ],
                                projection: {
                                  timestamps: false
                                }
                              },
                              Utils.safeFn( function ( err, user ) {
                                course.teachers[ j ] = user || {};
                                nextTeacher( j + 1, m );
                              } )
                            );

                          } else {
                            nextCourse( i + 1, n );
                          }
                        })( 0, course.teachers.length );

                      } else {
                        nextCourse( i + 1, n );
                      }

                    } else {
                      done();
                    }
                  })( 0, courses.length );

                };

                processCourses( teacherCourses, function () {
                  processCourses( studentCourses, function () {

                    // Return results to client
                    res.json( {
                      teaching: teacherCourses,
                      taking: studentCourses
                    } );

                  } );
                } );

              }
            } )
          );

        }
      } )
    );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get the specified Course object associated with the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiCourseGet( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Get course
    Course.get(
      {
        _id: req.params.course_id,
        projection: {
          students: false,
          timestamps: false,
          states: false
        }
      },
      Utils.safeFn( function ( err, course ) {
        if ( err ) {
          res.json( { err: err } );
        } else {
          res.json( course );
        }
      } )
    );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to add a new course.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiCourseAdd( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce certain values
    req.body.teacher_id = req.user._id;

    // Add course
    Course.add( req.body, Utils.safeFn( function ( err, course ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( course );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to join a new course.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiCourseJoin( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce certain values
    req.body._id = req.params.course_id;
    req.body.student_id = req.user._id;

    // Add course
    Course.addPendingStudent( req.body, Utils.safeFn( function ( err, course ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( course );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}


/**
 * Called to get a list of Minilesson objects associated with the specified course and the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMinilessonList( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce certain values
    req.params.user_id = req.user._id;

    // Get list of minilessons
    Minilesson.list( req.params, Utils.safeFn( function ( err, minilessons ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( minilessons );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get the specified Minilesson object associated with the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMinilessonGet( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Get minilesson
    Minilesson.get(
      {
        _id: req.params.minilesson_id,
        user_id: req.user._id,
        projection: {
          timestamps: false
        }
      },
      Utils.safeFn( function ( err, minilesson ) {
        if ( err ) {
          res.json( { err: err } );
        } else {
          res.json( minilesson );
        }
      } )
    );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to add a new minilesson to a course.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMinilessonAdd( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Add minilesson
    Minilesson.add(
      {
        user_id: req.user._id,
        course_id: req.params.course_id,
        title: req.body.title
      },
      Utils.safeFn( function ( err, minilesson ) {
        if ( err ) {
          res.json( { err: err } );
        } else {
          res.json( minilesson );
        }
      } )
    );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get a list of Page objects associated with the specified minilesson and the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiPageList( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce certain values
    req.params.user_id = req.user._id;
    req.params.projection = { timestamps: false };

    // Get list of minilessons
    Page.list( req.params, Utils.safeFn( function ( err, pages ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( pages );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get the specified Page object associated with the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiPageGet( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Get page
    Page.get(
      {
        _id: req.params.page_id,
        user_id: req.user._id,
        projection: {
          timestamps: false
        }
      },
      Utils.safeFn( function ( err, page ) {
        if ( err ) {
          res.json( { err: err } );
        } else {
          res.json( page );
        }
      } )
    );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to add a new page to a minilesson.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiPageAdd( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce some invariants
    req.body.user_id = req.user._id;
    req.body.minilesson_id = req.params.minilesson_id;

    // Add page
    Page.add( req.body, Utils.safeFn( function ( err, page ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( page );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get a list of Mcq objects associated with the specified page and the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMcqList( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce certain values
    req.params.user_id = req.user._id;
    req.params.projection = { timestamps: false };

    // Get list of minilessons
    Mcq.list( req.params, Utils.safeFn( function ( err, mcqs ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( mcqs );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get the specified Mcq object associated with the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMcqGet( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Get mcq
    Mcq.get(
      {
        _id: req.params.mcq_id,
        user_id: req.user._id,
        projection: {
          timestamps: false
        }
      },
      Utils.safeFn( function ( err, mcq ) {
        if ( err ) {
          res.json( { err: err } );
        } else {
          res.json( mcq );
        }
      } )
    );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to add a new MCQ to a page.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMcqAdd( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce some invariants
    req.body.user_id = req.user._id;
    req.body.page_id = req.params.page_id;

    // Add mcq
    Mcq.add( req.body, Utils.safeFn( function ( err, mcq ) {
      if ( err ) {
        res.json( { err: err } );
      } else {
        res.json( mcq );
      }
    } ) );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get a list of Submission objects associated with the specified mcq and the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiSubmissionList( req, res ) {

  // Ensure user
  if ( req.user ) {
    res.json( { err: 'Not implemented.' } );
  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to get the specified Submission object associated with the authenticated user.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiSubmissionGet( req, res ) {

  // Ensure user
  if ( req.user ) {
    res.json( { err: 'Not implemented.' } );
  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to add a submission to an MCQ.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiSubmissionAdd( req, res ) {

  // Ensure user
  if ( req.user ) {
    res.json( { err: 'Not implemented.' } );
  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}

/**
 * Called to when a user wants to view all grades of an MCQ.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMCQGrades( req, res ) {
  // Ensure user
  if ( req.user ) {
    Submission.list({ mcqId: req.params.mcq_id },
        function(err, submissions){
          if ( err ) {
            res.json( { err: err } );
          } else {
            /**
             * Replaces student ids with user objects in submissions.
             *
             * @param {Array.<Object>} submissions - list of Submission objects
             * @param {function()} done - callback
             */
            var gradesData = {};
            var processSubmissions = function ( submissions, done ) {

              // Loop through courses
              (function nextSubmission( i, n ) {
                if ( i < n ) {

                  var submission = submissions[ i ];

                  if ( submission.studentId ) {

                    User.get(
                        {
                          _id: submission.studentId,
                          projection: {
                            timestamps: false
                          }
                        },
                        Utils.safeFn( function ( err, user ) {
                          //submission.studentId = user || {};
                          gradesData[user.name] = submission.score
                        })
                    )
                  } else {
                    nextSubmission( i + 1, n );
                  }

                } else {
                  done();
                }
              })( 0, submissions.length );

            };

            processSubmissions( submissions, function () {
              // Return results to client
              res.json( {
                grades: gradesData
              } );
            } );
          }
        }
    )
  } else {
    res.status( 400 ).json({ err: 'Bad Request: User must be authenticated to process request.' } );
  }
}
