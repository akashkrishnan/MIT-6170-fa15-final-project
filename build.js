/**
 * Created by akashkrishnan on 24-Nov-15.
 */

'use strict';

var Config = require( './config.js' );
var fs = require( 'fs' );
var path = require( 'path' );
var Vulcanize = require( 'vulcanize' );
var crisper = require( 'crisper' );
var ClosureCompiler = require( 'closurecompiler' );

module.exports = build;

function build( done ) {
  if ( Config.build ) {
    vulcanize( function ( err, html ) {
      if ( err ) {
        done( err );
      } else {
        crisp( html, function ( err ) {
          if ( err ) {
            done( err );
          } else {
            minify( function ( err ) {
              if ( err ) {
                done( err );
              } else {
                done( null );
              }
            } );
          }
        } );
      }
    } );
  } else {
    fs.unlink( 'public/index.js', function () {
      fs.unlink( 'public/index.html', function () {
        done( null );
      } );
    } );
  }
}

function vulcanize( done ) {

  console.log( 'Vulcanizing polymers.' );

  var vulcan = new Vulcanize( {
    abspath: path.join( __dirname, '/source' ),
    excludes: [],
    stripExcludes: [],
    inlineScripts: true,
    inlineCss: true,
    addedImports: [],
    redirects: [],
    implicitStrip: true,
    stripComments: true
  } );

  vulcan.process( 'index.html', function ( err, html ) {
    if ( err ) {
      console.log( 'FAILED: Vulcanize' );
      done( err, null );
    } else {
      done( null, html );
    }
  } );
  
}

function crisp( html, done ) {
  console.log( 'Crisping HTML and JavaScript.' );
  var index = crisper.split( html, '/index.js' );
  fs.writeFile( 'public/index.html', index.html, 'utf-8', function ( err ) {
    if ( err ) {
      console.log( 'FAILED: Crisping' );
      done( err );
    } else {
      fs.writeFile( 'public/index.js', index.js, 'utf-8', function ( err ) {
        if ( err ) {
          console.log( 'FAILED: Crisping' );
          done( err );
        } else {
          done( null );
        }
      } );
    }
  } );
}

function minify( done ) {
  console.log( 'Minifying JavaScript.' );
  ClosureCompiler.compile(
    [ 'public/index.js' ],
    {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      language_in: 'ECMASCRIPT5'
    },
    function ( err, result ) {
      if ( result ) {
        fs.writeFile( 'public/index.js', result, 'utf-8', function ( err ) {
          if ( err ) {
            console.log( 'FAILED: Minify' );
            done( err );
          } else {
            done( null );
          }
        } );
      } else {
        console.log( 'FAILED: Closure Compiler' );
        done( err );
      }
    }
  );
}
