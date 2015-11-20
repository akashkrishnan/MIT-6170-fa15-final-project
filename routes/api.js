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

module.exports = function ( app ) {

  app.get( '/api/user.json', user );

  app.post( '/api/login', apiLogin );
  app.post( '/api/register', apiRegister );
  app.post( '/api/logout', apiLogout );

  app.post( '/api/course', apiCourseAdd );
  app.post( '/api/course/:courseId/minilesson', apiMinilessonAdd );
  app.post( '/api/minilesson/:minilessonId/page', apiPageAdd );
  app.post( '/api/page/:pageId/mcq', apiMcqAdd );
  app.post( '/api/mcq/:mcqId/submission', apiSubmissionAdd );

};

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
 * Called to when a user wants to add a new minilesson to a course.
 *
 * @param {object} req - req
 * @param {object} res - res
 */
function apiMinilessonAdd( req, res ) {

  // Ensure user
  if ( req.user ) {

    // Enforce certain values
    req.body.teacher_id = req.user._id;

    res.json( { err: 'Not implemented.' } );

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

    // Enforce certain values
    req.body.teacher_id = req.user._id;

    res.json( { err: 'Not implemented.' } );

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

    // Enforce certain values
    req.body.teacher_id = req.user._id;

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

    // Enforce certain values
    req.body.teacher_id = req.user._id;

    res.json( { err: 'Not implemented.' } );

  } else {
    res.status( 400 ).json( { err: 'Bad Request: User must be authenticated to process request.' } );
  }

}
