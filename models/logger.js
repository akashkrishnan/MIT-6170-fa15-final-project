/**
 * AUTHOR: Akash Krishnan <ak@aakay.net>
 */

'use strict';

require( 'colors' );

module.exports = {
  log: log,
  info: info,
  warn: warn,
  error: error
};

/**
 * Prints a log message to the console.
 *
 * @param {*} msg - error message or error object
 */
function log( msg ) {
  console.log( String( msg ) );
}

/**
 * Prints an info message to the console.
 *
 * @param {*} msg - error message or error object
 */
function info( msg ) {
  console.info( String( msg ).blue );
}

/**
 * Prints a warning message to the console.
 *
 * @param {*} msg - error message or error object
 */
function warn( msg ) {
  console.warn( String( msg ).yellow );
}

/**
 * Prints an error message or error object to the console.
 *
 * @param {*} msg - error message or error object
 */
function error( msg ) {
  if ( msg instanceof Error ) {
    console.error( String( msg.stack ).red );
  } else {
    console.error( String( msg ).red );
  }
}
