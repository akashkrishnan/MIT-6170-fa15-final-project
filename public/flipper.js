/**
 * Created by akashkrishnan on 11/17/15.
 */

'use strict';

var Flipper = function () {

  var that = Object.create( Flipper.prototype );

  var ajax = function ( method, url, data, done ) {

    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
      done( xhr.response );
    };

    xhr.open( method, url, true );
    xhr.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8' );
    xhr.responseType = 'json';
    xhr.send( JSON.stringify( data ) );

  };

  that.course = {
    add: function ( data, done ) {
      if ( data && data.courseName ) {
        if ( data.courseName.length > 100 ) {
          // TODO: USE CONFIG
          done( new Error( 'Name too long. Please shorten the name to at most 100 characters.' ) );
        } else {
          ajax( 'POST', '/api/course', data, function ( data ) {
            if ( data ) {
              if ( data.err ) {
                done( data.err, null );
              } else {
                done( null, data );
              }
            } else {
              console.error( 'Unable to add course. Invalid server response.' );
              alert( 'Unable to add course. Invalid server response.' );
            }
          } );
        }
      }
    }
  };

  Object.freeze( that.course );
  Object.freeze( that );

  return that;

};
