/**
 * Created by akashkrishnan on 23-Nov-15.
 */

'use strict';

var Utils = require( '../../models/utils.js' );
var Minilesson = require( '../../models/minilesson.js' );
var Page = require( '../../models/page.js' );

module.exports = function ( app ) {

  app.get( '/api/minilessons/:minilesson_id', apiMinilessonGet );
  app.get( '/api/minilessons/:minilesson_id/pages', apiPageList );
  app.post( '/api/minilessons/:minilesson_id/pages', apiPageAdd );

};

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
