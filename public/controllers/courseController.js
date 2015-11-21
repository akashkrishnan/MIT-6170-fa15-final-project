/**
 * Created by akashkrishnan on 18-Nov-15.
 * Last modified by akashkrishnan on 18-Nov-15 21:00.
 */

'use strict';

(function () {

  var minilessonAddDialog = document.querySelector( '#minilesson-add-dialog' );
  if ( minilessonAddDialog ) {

    var courseId = minilessonAddDialog.getAttribute( 'course-id' );

    // Click listener for add-minilesson create button click event
    var createBtn = document.querySelector( '#minilesson-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get minilesson name from form
        var nameInput = document.querySelector( '#minilesson-add-dialog [name-input]' );
        if ( nameInput ) {

          var data = { courseId: courseId, minilessonName: nameInput.value };

          flipper.minilesson.add( data, function ( err, minilesson ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE MINILESSON OBJECT?
              console.log( minilesson );
              toastr.info( 'Minilesson has been added.' );

              // TODO: POSSIBLY REDIRECT TO MINILESSON VIEW?

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              minilessonAddDialog.click();

            }
          } );

        } else {
          console.error( 'Missing #minilesson-add-dialog [name-input].' );
        }

      }, false );
    } else {
      console.error( 'Missing #minilesson-add-dialog [create].' );
    }

  } else {
    console.error( 'Missing #minilesson-add-dialog.' );
  }

})();
