'use strict';

require( 'colors' );

module.exports = {
  log: log,
  info: info,
  warn: warn,
  error: error
};

function log( msg ) {
  console.log( String( msg ) );
}

function info( msg ) {
  console.info( String( msg ).blue );
}

function warn( msg ) {
  console.warn( String( msg ).yellow );
}

function error( msg ) {
  if ( msg instanceof Error ) {
    console.error( String( msg.stack ).red );
  } else {
    console.error( String( msg ).red );
  }
}
