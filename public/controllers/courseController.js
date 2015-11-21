/**
 * Created by akashkrishnan on 18-Nov-15.
 * Last modified by akashkrishnan on 18-Nov-15 21:00.
 */

'use strict';

(function () {

  var minilessonAddDialog = document.querySelector( '#minilesson-add-dialog' );
  if ( minilessonAddDialog ) {

    var course_id = minilessonAddDialog.getAttribute( 'course-id' );

    // Click listener for add-minilesson create button click event
    var createBtn = document.querySelector( '#minilesson-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get minilesson name from form
        var titleInput = document.querySelector( '#minilesson-add-dialog [title-input]' );
        if ( titleInput ) {

          var data = { course_id: course_id, title: titleInput.value };

          flipper.minilesson.add( data, function ( err, minilesson ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE MINILESSON OBJECT?
              console.log( minilesson );
              toastr.info( 'Minilesson has been added.' );

              // TODO: WE SHOULDN'T NEED TO REFRESH
              // Refresh for now
              location.reload();

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              minilessonAddDialog.click();

            }
          } );

        } else {
          console.error( 'Missing #minilesson-add-dialog [title-input].' );
        }

      }, false );
    } else {
      console.error( 'Missing #minilesson-add-dialog [create].' );
    }

  } else {
    console.error( 'Missing #minilesson-add-dialog.' );
  }

  /* -------------------------------------------------------------------------------------------------------------- */

  var pageAddDialog = document.querySelector( '#page-add-dialog' );
  if ( pageAddDialog ) {

    var minilesson_id = pageAddDialog.getAttribute( 'minilesson-id' );

    // Click listener for add-page create button click event
    var createBtn = document.querySelector( '#page-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get minilesson name from form
        var titleInput = document.querySelector( '#page-add-dialog [title-input]' );
        var resourceInput = document.querySelector( '#page-add-dialog [resource-input]' );
        if ( titleInput ) {

          var data = {
            minilesson_id: minilesson_id,
            title: titleInput.value,
            resource: resourceInput.value || ''
          };

          flipper.page.add( data, function ( err, page ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE PAGE OBJECT?
              console.log( page );
              toastr.info( 'Page has been added.' );

              // TODO: WE SHOULDN'T NEED TO REFRESH
              // Refresh for now
              location.reload();

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              pageAddDialog.click();

            }
          } );

        } else {
          console.error( 'Missing #page-add-dialog [title-input].' );
        }

      }, false );
    } else {
      console.error( 'Missing #page-add-dialog [create].' );
    }

  } else {
    console.error( 'Missing #page-add-dialog.' );
  }

  /* -------------------------------------------------------------------------------------------------------------- */

  var mcqAddDialog = document.querySelector( '#mcq-add-dialog' );
  if ( mcqAddDialog ) {

    var minilesson_id = mcqAddDialog.getAttribute( 'minilesson-id' );

    // Click listener for add-page create button click event
    var createBtn = document.querySelector( '#mcq-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get minilesson name from form
        var titleInput = document.querySelector( '#mcq-add-dialog [title-input]' );
        var resourceInput = document.querySelector( '#mcq-add-dialog [resource-input]' );

        var data = {
          minilesson_id: minilesson_id,
          title: titleInput.value,
          resource: resourceInput.value || ''
        };

        flipper.page.add( data, function ( err, page ) {
          if ( err ) {
            console.error( err );
            toastr.error( err );
          } else {

            // TODO: DO SOMETHING WITH THE PAGE OBJECT?
            console.log( page );
            toastr.info( 'Page has been added.' );

            // TODO: WE SHOULDN'T NEED TO REFRESH
            // Refresh for now
            location.reload();

            // Close the dialog --- this works because the dialog is a dialog-close-trigger
            mcqAddDialog.click();

          }
        } );

      }, false );
    } else {
      console.error( 'Missing #mcq-add-dialog [create].' );
    }

  } else {
    console.error( 'Missing #mcq-add-dialog.' );
  }

})();
