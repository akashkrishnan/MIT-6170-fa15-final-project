/**
 * Created by akashkrishnan on 19-Nov-15.
 * Last modified by akashkrishnan on 19-Nov-15 01:04.
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

module.exports = function ( app ) {

  // Navigation
  app.get( '/', index );

  app.get( '/config.json', config );
  app.get( '/register', register );
  app.get( '/logout', logout );

  app.get( '/courses/:course_id/', courseRedirect );
  app.get( '/courses/:course_id/minilessons/:minilesson_id?/:page_id?', course );

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
            } )
          );
        }
      } )
    );
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
 * Redirects invalid course route to a valid default route.
 *
 * @param {object} req - req
 * @param {object} res - res
 * @param {function} next - callback
 */
function courseRedirect( req, res, next ) {
  if ( req.user ) {
    res.redirect( '/courses/' + req.params.course_id + '/minilessons' );
  } else {
    next();
  }
}

/**
 * Called when the user wants to view a course.
 *
 * @param {object} req - req
 * @param {object} res - res
 * @param {function} next - callback
 */
function course( req, res, next ) {
  if ( req.user ) {

    // Get course
    Course.getWithUser(
      {
        _id: req.params.course_id,
        user_id: req.user._id
      },
      Utils.safeFn( function ( err, course ) {
        if ( err ) {
          next();
        } else {

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
            Utils.safeFn( Utils.safeFn( function ( err, teacherCourses ) {
              if ( err ) {
                next();
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
                  Utils.safeFn( Utils.safeFn( function ( err, studentCourses ) {
                    if ( err ) {
                      next();
                    } else {

                      // Get minilessons in the course
                      Minilesson.list(
                        {
                          user_id: req.user._id,
                          course_id: course._id.toString()
                        },
                        Utils.safeFn( function ( err, minilessons ) {
                          if ( err ) {
                            next();
                          } else if ( req.params.minilesson_id ) {

                            // Get minilesson
                            Minilesson.get(
                              {
                                _id: req.params.minilesson_id,
                                user_id: req.user._id
                              },
                              Utils.safeFn( function ( err, minilesson ) {
                                if ( err ) {
                                  next();
                                } else {

                                  // Render the view
                                  res.render( 'course', {
                                    web: Config.web,
                                    self: req.user,
                                    teacherCourses: teacherCourses,
                                    studentCourses: studentCourses,
                                    course: course,
                                    minilessons: minilessons,
                                    minilesson: minilesson,
                                    pages: minilessons,
                                    page: {}
                                  } );

                                }
                              } )
                            );

                          } else {

                            // Render the view
                            res.render( 'course', {
                              web: Config.web,
                              self: req.user,
                              teacherCourses: teacherCourses,
                              studentCourses: studentCourses,
                              course: course,
                              minilessons: minilessons,
                              minilesson: {}
                            } );

                          }
                        } )
                      );

                    }
                  } ) )
                );

              }
            } ) )
          );

        }
      } )
    );

  } else {
    next();
  }
}
