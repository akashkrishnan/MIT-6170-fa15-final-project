/**
 * Created by akashkrishnan on 17-Nov-15.
 * Last modified by akashkrishnan on 17-Nov-15 11:13.
 */

'use strict';

( function () {

  var i;
  var n;

  // Register all dialogs and make sure they're hidden when they're supposed to be hidden

  var dialogs = document.querySelectorAll( '[dialog]' );

  var dialogClickHandler = function ( dialog ) {
    return function ( e ) {
      if ( e.target === dialog ) {
        dialog.style.display = 'none';
      }
    };
  };

  for ( i = 0, n = dialogs.length; i < n; i++ ) {

    // Make sure dialogs are hidden by default
    dialogs[ i ].style.display = 'none';

    // Make sure dialogs are hidden when focus is lost
    dialogs[ i ].addEventListener( 'click', dialogClickHandler( dialogs[ i ] ), false );

  }

  // Register all triggers that show the specified dialog with the specified event occurs on the trigger element

  var triggers = document.querySelectorAll( '[dialog-trigger]' );

  var triggerEventHandler = function ( trigger ) {
    return function () {
      var id = trigger.getAttribute( 'ref' );
      var dialog = document.querySelector( '#' + id );
      if ( dialog ) {
        if ( dialog.hasAttribute( 'dialog' ) ) {
          dialog.style.display = null;
        } else {
          console.error( 'Dialog referenced by dialog-trigger is missing the dialog attribute.' );
        }
      } else {
        console.error( 'Dialog referenced by dialog-trigger not found.' );
      }
    };
  };

  for ( i = 0, n = triggers.length; i < n; i++ ) {
    var eventName = triggers[ i ].getAttribute( 'dialog-trigger' ) || 'click';
    triggers[ i ].addEventListener( eventName, triggerEventHandler( triggers[ i ] ), false );
  }

} )();
