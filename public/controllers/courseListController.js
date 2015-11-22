/**
 * Created by akashkrishnan on 17-Nov-15.
 * Last modified by akashkrishnan on 17-Nov-15 15:29.
 */

'use strict';

(function () {

  var courseAddDialog = document.querySelector( '#course-add-dialog' );
  if ( courseAddDialog ) {

    // Click listener for add-course create button click event
    var createBtn = document.querySelector( '#course-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get course name from form
        var nameInput = document.querySelector( '#course-add-dialog [name-input]' );
        if ( nameInput ) {

          var data = { courseName: nameInput.value };

          flipper.course.add( data, function ( err, course ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE COURSE OBJECT?
              console.log( course );
              toastr.info( 'Course has been added.' );

              // TODO: WE SHOULDN'T NEED TO REFRESH
              // Refresh for now
              location.reload();

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              courseAddDialog.click();

            }
          } );

        } else {
          console.error( 'Missing #course-add-dialog [name-input].' );
        }

      }, false );
    } else {
      console.error( 'Missing #course-add-dialog [create].' );
    }

  } else {
    console.error( 'Missing #course-add-dialog.' );
  }


  var courseJoinDialog = document.querySelector( '#course-join-dialog' );

  if ( courseJoinDialog ) {

    // Click listener for join-course button click event
    var joinBtns = document.querySelectorAll( '#course-join-dialog [join]' );
    if ( joinBtns ) {
      joinBtns = [].slice.call(joinBtns);
      joinBtns.forEach(function (joinBtn) {
        joinBtn.addEventListener( 'click', function (event) {
        // Get course name from form
        //var nameInput = document.querySelector( '#course-add-dialog [name-input]' );
        //var idInput = document.querySelector('#course-add-dialog [id-input]');
          var clickedElement = event.target;
          var courseClicked = clickedElement.dataset.courseid;
          console.log('registered click');

          if (courseClicked) {

          var data = { courseId: courseClicked };

          flipper.course.addPendingStudent( data, function ( err, course ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE COURSE OBJECT?
              console.log( course );
              toastr.info( 'Course has been added.' );

              // TODO: WE SHOULDN'T NEED TO REFRESH
              // Refresh for now
              location.reload();

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              courseJoinDialog.click();

            }
          } );

        } else {
          console.error( 'Missing #course-join-dialog [courseClicked].' );
        }

        }, false );
      });
    } else {
      console.error( 'Missing #course-join-dialog [join].' );
    }
  } else {
    console.error( 'Missing #course-join-dialog.' );
  }

})();
