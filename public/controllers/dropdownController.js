/**
 * Created by akashkrishnan on 17-Nov-15.
 * Last modified by akashkrishnan on 17-Nov-15 16:21.
 */

'use strict';

(function () {

  var i;
  var n;

  // Register all dropdowns and make sure they're hidden
  var dropdowns = document.querySelectorAll( '[dropdown]' );
  for ( i = 0, n = dropdowns.length; i < n; i++ ) {
    dropdowns[ i ].style.display = 'none';
    dropdowns[ i ].style.visibility = 'visible';
  }

  // Register all triggers that show the specified dialog when clicked

  var toggleTriggers = document.querySelectorAll( '[dropdown-toggle-trigger]' );

  var toggleTriggerEventHandler = function ( trigger ) {
    return function () {
      var id = trigger.getAttribute( 'dropdown-toggle-trigger' );
      var dropdown = document.querySelector( '#' + id );
      if ( dropdown ) {
        if ( dropdown.hasAttribute( 'dropdown' ) ) {

          // Toggle the display state
          if ( dropdown.style.display ) {
            dropdown.style.display = null;
          } else {
            dropdown.style.display = 'none';
          }

        } else {
          console.error( 'Dropdown referenced by dropdown-toggle-trigger is missing the dropdown attribute.' );
        }
      } else {
        console.error( 'Dropdown referenced by dropdown-toggle-trigger not found.' );
      }
    };
  };

  for ( i = 0, n = toggleTriggers.length; i < n; i++ ) {
    toggleTriggers[ i ].addEventListener( 'click', toggleTriggerEventHandler( toggleTriggers[ i ] ), false );
  }

})();
