/**
 * Created by akashkrishnan on 19-Nov-15.
 * Last modified by akashkrishnan on 19-Nov-15 01:04.
 */

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

  app.get( '/courses/:courseId/minilessons/:minilessonId?', courseMinilessons );

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
    Course.getCoursesForTeacher( { user_id: req.user._id }, Utils.safeFn( function ( err, teacherCourses ) {
      if ( err ) {
        res.json( { err: err } );
      } else {

        // Get courses the user takes
        Course.getCoursesForStudent( { user_id: req.user._id }, Utils.safeFn( function ( err, studentCourses ) {
          if ( err ) {
            res.json( { err: err } );
          } else {

            var allCourses = teacherCourses.concat( studentCourses );
            var courseTeachers = {};

            (function next_course( j, n_courses ) {
              var course = allCourses[ j ];

              if ( j < n_courses ) {

                var next_teacher = function ( i, course, n_teachers ) {
                  if ( i < n_teachers ) {
                    var teacherId = course.teachers[ i ];
                    User.get( { _id: teacherId }, Utils.safeFn( function ( err, teacherObj ) {
                      if ( err ) {
                        next_teacher( i + 1, n_teachers );
                      } else {
                        courseTeachers[ course ].push( teacherObj );
                        next_teacher( i + 1, n_teachers );
                      }
                    } ) );
                  } else {
                    next_course( j + 1, n_courses );
                  }
                };

                if ( !(course in courseTeachers) ) {
                  courseTeachers[ course ] = [];
                  next_teacher( 0, course, course.teachers.length );
                } else {
                  next_course( j + 1, n_courses );
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
            })( 0, allCourses.length );
          }
        } ) );
      }
    } ) );
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

    // Get course
    Course.get( { _id: req.params.courseId }, Utils.safeFn( function ( err, course ) {
      if ( err ) {
        next();
      } else {

        // Get courses the user teaches
        Course.getCoursesForTeacher( { user_id: req.user._id }, Utils.safeFn( function ( err, teacherCourses ) {
          if ( err ) {
            res.json( { err: err } );
          } else {

            // Get courses the user takes
            Course.getCoursesForStudent( { user_id: req.user._id }, Utils.safeFn( function ( err, studentCourses ) {
              if ( err ) {
                res.json( { err: err } );
              } else {

                // Render the view
                res.render( 'courseMinilessons', {
                  web: Config.web,
                  self: req.user,
                  teacherCourses: teacherCourses,
                  studentCourses: studentCourses,
                  course: course
                } );

              }
            } ) );

          }
        } ) );

      }
    } ) );

  } else {
    next();
  }
}
