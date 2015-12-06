'use strict';

var Log = require( '../models/log.js' );

module.exports = {
  validate: validate
};

function validate( app ) {

  app.post( '*', checkToken );
  app.put( '*', checkToken );
  app.delete( '*', checkToken );

}

function checkToken( req, res, next ) {

  // Only applicable to authenticated users
  if ( req.user ) {

    // Check for token
    if ( req.body.token ) {

      // Verify token against user session token
      if ( req.body.token === req.session.token ) {

        // LGTM AFAIK
        next();

      } else {

        // All post, put, delete actions must contain a valid token
        Log.warn( 'Prevented possible CSRF attack.' );
        res.json( { err: 'Invalid token.' } );

      }

    } else {

      // All post, put, delete actions must contain a token
      Log.warn( 'Prevented possible CSRF attack.' );
      res.json( { err: 'Missing token.' } );

    }

  } else {
    next();
  }

}
