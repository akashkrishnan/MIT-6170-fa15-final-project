/**
 * AUTHOR: Akash Krishnan <ak@aakay.net>
 */

'use strict';

var Config = require( '../config.js' );
var Utils = require( '../models/utils.js' );
var Session = require( '../models/session.js' );
var User = require( '../models/user.js' );
var Course = require( '../models/course.js' );

module.exports = function ( app ) {

  // Navigation
  app.get( '/', index );
  app.get( '/config.json', config );
  app.get( '/register', register );
  app.get( '/logout', logout );
  app.get( '/courses/:name/minilessons/:minilessonId?', courseMinilessons );

  // API
  app.post( '/api/login', apiLogin );
  app.post( '/api/register', apiRegister );
  app.post( '/api/logout', apiLogout );
  app.post( '/api/course', apiCourseAdd );

  app.get( '*', otherwise );

};

/**
 * Called when the user wants to view the index.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function index( req, res ) {
  if ( req.user ) {

    // Get courses the user teaches
    Course.getCoursesForTeacher( { user_id: req.user._id }, function ( err, teacherCourses ) {
      if ( err ) {
        res.json( { err: err } );
      } else {

        console.log( teacherCourses );


        // Get courses the user takes
        Course.getCoursesForStudent( { user_id: req.user._id }, function ( err, studentCourses ) {
          if ( err ) {
            res.json( { err: err } );
          } else {

            console.log( studentCourses );

            var allCourses = teacherCourses.concat(studentCourses);
            var courseTeachers = {};

            (function next_course ( j, n_courses ) {
              var course = allCourses[j];

              if (j < n_courses) {

                var next_teacher = function ( i, course, n_teachers ) {
                  if(i < n_teachers ) {
                    var teacherId = course.teachers[i];
                    User.get({_id:teacherId}, function ( err, teacherObj ) {
                      if(err) done(err);
                      else {
                        console.log(teacherObj);
                        courseTeachers[course].push(teacherObj);
                        next_teacher(i+1, n_teachers);
                      }
                    });
                  } else {
                    next_course(j+1, n_courses);
                  }
                };

                if (!(course in courseTeachers)) {
                  courseTeachers[course] = [];
                  next_teacher(0, course, course.teachers.length);
                } else {
                  next_course(j+1, n_courses);
                }

              } else {
                res.render( 'courseList', {
                  web: Config.web,
                  self: req.user,
                  teacherCourses: teacherCourses,
                  studentCourses: studentCourses,
                  courseTeachers: courseTeachers
                } );
              }
            })(0, allCourses.length);
          }
        } );
      }
    } );
  } else {
    res.render( 'login', {
      web: Config.web
    } );
  }
}

/**
 * Called when the user requests the config file.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function config( req, res ) {

  // Only send registration config to client
  res.json( Utils.validateObject( Config, {
    registration: { required: true }
  } ) );

}

/**
 * Called when the user wants to view the registration page.
 *
 * @param {object} req - req
 * @param {object} res - res
 * @param {function} next - callback
 */
function register( req, res, next ) {

  // Ensure guest (i.e. no user)
  if ( req.user ) {
    next();
  } else {
    res.render( 'register', {
      web: Config.web
    } );
  }

}

/**
 * Called when the user wants to logout.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function logout( req, res ) {

  // This route is restricted to authenticated users
  if ( req.user ) {

    // Remove session
    Session.remove( { _id: req.apikey }, Utils.safeFn( function ( err ) {
      if ( err ) {
        res.redirect( '/' );
      } else {

        // Remove cookie
        res.clearCookie( Config.web.cookie.name, {} ).redirect( '/' );

      }
    } ) );

  } else {
    res.redirect( '/' );
  }

}

/**
 * Called when the user wants to view the list of minilessons or a specific minilesson.
 *
 * @param {object} req - req
 * @param {object} res - res
 * @param {function} next - callback
 */
function courseMinilessons( req, res, next ) {
  if ( req.user ) {
    res.render( 'courseList', {
      web: Config.web,
      self: req.user
    } );
  } else {
    next();
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
          if ( err ) {
            res.json( { err: err } );
          } else {

            // Set cookie to be used for future authentication
            res.cookie( Config.web.cookie.name, session._id ).json( {} );

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
 * Called when no routes were matched.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function otherwise( req, res ) {
  console.error( 'Received bad request: ' + req.originalUrl );
  res.redirect( '/' );
}
