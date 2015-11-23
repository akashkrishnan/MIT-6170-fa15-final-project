/**
 * Created by akashkrishnan on 17-Nov-15.
 * Last modified by akashkrishnan on 17-Nov-15 15:29.
 */

'use strict';

(function () {

  var approveBtns = document.querySelectorAll( '[approve]' );

  if (approveBtns) {
    approveBtns = [].slice.call( approveBtns );
    approveBtns.forEach( function (approveBtn) {
      approveBtn.addEventListener( 'click', function ( event ) {
        var student_id = event.target.getAttribute( 'student-id' );
        var course_id = event.target.getAttribute( 'course-id' );
        if ( student_id && course_id ) {
          var data = { student_id: student_id, course_id: course_id }
          flipper.course.addStudent( data, function ( err, course ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE COURSE OBJECT?
              console.log( course );
              toastr.info( 'Student Approved.' );

              // TODO: WE SHOULDN'T NEED TO REFRESH
              // Refresh for now
              location.reload();

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              courseJoinDialog.click();

            }
          } );
        } else {
          console.error( 'Missing [student-id] or [course-id].' );
        } 
      }, false );
    });
  } else {
    console.error( 'Missing [approve]' );
  }



  var declineBtns = document.querySelectorAll( '[decline]' );

  if (declineBtns) {
    declineBtns = [].slice.call( declineBtns );
    declineBtns.forEach( function (declineBtn) {
      declineBtn.addEventListener( 'click', function ( event ) {
        var student_id = event.target.getAttribute( 'student-id' );
        var course_id = event.target.getAttribute( 'course-id' );
        if ( student_id && course_id ) {
          var data = { student_id: student_id, course_id: course_id }
          flipper.course.removePendingStudent( data, function ( err, course ) {
            if ( err ) {
              console.error( err );
              toastr.error( err );
            } else {

              // TODO: DO SOMETHING WITH THE COURSE OBJECT?
              console.log( course );
              toastr.info( 'Student Removed.' );

              // TODO: WE SHOULDN'T NEED TO REFRESH
              // Refresh for now
              location.reload();

              // Close the dialog --- this works because the dialog is a dialog-close-trigger
              courseJoinDialog.click();

            }
          } );
        } else {
          console.error( 'Missing [student-id] or [course-id].' );
        } 
      }, false );
    });
  } else {
    console.error( 'Missing [decline]' );
  }


})();
