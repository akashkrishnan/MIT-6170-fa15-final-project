/**
 * Created by akashkrishnan on 17-Nov-15.
 * Last modified by akashkrishnan on 17-Nov-15 11:13.
 */

'use strict';

( function () {

  var i;
  var n;

  // Register all dialogs and make sure they're hidden
  var dialogs = document.querySelectorAll( '[dialog]' );
  for ( i = 0, n = dialogs.length; i < n; i++ ) {
    dialogs[ i ].style.display = 'none';
  }

  // Register all triggers that show the specified dialog when clicked

  var openTriggers = document.querySelectorAll( '[dialog-open-trigger]' );

  var openTriggerEventHandler = function ( trigger ) {
    return function () {
      var id = trigger.getAttribute( 'dialog-open-trigger' );
      var dialog = document.querySelector( '#' + id );
      if ( dialog ) {
        if ( dialog.hasAttribute( 'dialog' ) ) {
          dialog.style.display = null;
        } else {
          console.error( 'Dialog referenced by dialog-open-trigger is missing the dialog attribute.' );
        }
      } else {
        console.error( 'Dialog referenced by dialog-open-trigger not found.' );
      }
    };
  };

  for ( i = 0, n = openTriggers.length; i < n; i++ ) {
    openTriggers[ i ].addEventListener( 'click', openTriggerEventHandler( openTriggers[ i ] ), false );
  }

  // Register all triggers that hide the specified dialog when clicked

  var closeTriggers = document.querySelectorAll( '[dialog-close-trigger]' );

  var closeTriggerEventHandler = function ( trigger ) {
    return function ( e ) {
      if ( e.target === trigger ) {
        var id = trigger.getAttribute( 'dialog-close-trigger' );
        var dialog = document.querySelector( '#' + id );
        if ( dialog ) {
          if ( dialog.hasAttribute( 'dialog' ) ) {
            dialog.style.display = 'none';
          } else {
            console.error( 'Dialog referenced by dialog-close-trigger is missing the dialog attribute.' );
          }
        } else {
          console.error( 'Dialog referenced by dialog-close-trigger not found.' );
        }
      }
    };
  };

  for ( i = 0, n = closeTriggers.length; i < n; i++ ) {
    closeTriggers[ i ].addEventListener( 'click', closeTriggerEventHandler( closeTriggers[ i ] ), false );
  }

} )();
