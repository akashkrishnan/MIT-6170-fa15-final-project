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

  that.user = {

    register: function ( data, done ) {
      if ( data ) {
        ajax( 'POST', '/api/register', data, function ( data ) {
          if ( data ) {
            if ( data.err ) {
              done( data.err, null );
            } else {
              done( null, data );
            }
          } else {
            done( new Error( 'Unable to register. Invalid server response.' ), null );
          }
        } );
      }
    },

    login: function ( data, done ) {
      if ( data ) {
        ajax( 'POST', '/api/login', data, function ( data ) {
          if ( data ) {
            if ( data.err ) {
              done( data.err, null );
            } else {
              done( null, data );
            }
          } else {
            done( new Error( 'Unable to login. Invalid server response.' ), null );
          }
        } );
      }
    },

    logout: function ( data, done ) {
      if ( data ) {
        ajax( 'POST', '/api/logout', data, function ( data ) {
          if ( data ) {
            if ( data.err ) {
              done( data.err, null );
            } else {
              done( null, data );
            }
          } else {
            done( new Error( 'Unable to logout. Invalid server response.' ), null );
          }
        } );
      }
    }

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
              done( new Error( 'Unable to add course. Invalid server response.' ), null );
            }
          } );
        }
      }
    },

    remove: function ( data, done ) {
      if ( data ) {
        done( new Error( 'Not implemented.' ) );
      }
    }

  };

  that.minilesson = {};

  that.page = {};

  that.mcq = {};

  that.submission = {};

  that.grade = {};

  Object.freeze( that.user );
  Object.freeze( that.course );
  Object.freeze( that.minilesson );
  Object.freeze( that.page );
  Object.freeze( that.mcq );
  Object.freeze( that.submission );
  Object.freeze( that.grade );
  Object.freeze( that );

  return that;

};
