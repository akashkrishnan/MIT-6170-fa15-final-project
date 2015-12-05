/**
 * AUTHOR: Akash Krishnan <ak@aakay.net>
 */

'use strict';

( function () {

  var update = function () {

    var spans = document.querySelectorAll( 'span[time]' );

    forEach( spans, function ( span ) {
      var d = new Date( span.getAttribute( 'time' ) );
      var m = moment( d );
      span.innerHTML = m.fromNow();
    } );

  };

  update();

  setInterval( update, 30000 );

} )();
