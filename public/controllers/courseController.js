/**
 * Created by akashkrishnan on 18-Nov-15.
 * Last modified by akashkrishnan on 18-Nov-15 21:00.
 */

'use strict';

( function () {



  var minilessonEditDialog = document.querySelector( '#minilesson-edit-dialog' );
  if ( minilessonEditDialog ) {

    var course_id = minilessonEditDialog.getAttribute( 'course-id' );

    var editBtn = document.querySelector( '#minilesson-edit-dialog [set]' );

    if ( editBtn ) {
      editBtn.addEventListener( 'click', function (e) {
        e.preventDefault();

        var minilesson_id = editBtn.getAttribute( 'minilesson-id' );
        var course_id = editBtn.getAttribute( 'course-id' );
        var titleInput = document.querySelector( '#minilesson-edit-dialog [title-input]' );
        var dueDate = document.querySelector("#minilesson-edit-dialog [due-Date-input]");
        var currentTimeZoneOffsetInMinutes = new Date().getTimezoneOffset();
        var d = new Date( dueDate.value);
        var m = moment( d );
        var dueDateTZ = m.add(currentTimeZoneOffsetInMinutes, "m");      
        var data = { 'minilesson_id': minilesson_id, 'course_id': course_id, 'title': titleInput.value, 'due_date': dueDateTZ }

        flipper.minilesson.edit( data, function ( err, minilesson ) {
          if ( err ) {
            console.log( err );
            toastr.error( err );
          } else {
            console.log( minilesson );
            toastr.info( 'Minilesson has been edited.' );
   
            location.reload();
          }
         } );
       } );
    } else {
      console.error( 'Missing editBtn.' );
    }
  } else {
    console.error( 'Missing #minilesson-edit-dialog.' );
  }

  /* -------------------------------------------------------------------------------------------------------------- */


  var publishBtn = document.querySelector( '#publish-btn' );
  if ( publishBtn ) {
    publishBtn.addEventListener( 'click', function () {
      var minilesson_id = publishBtn.getAttribute( 'minilesson-id' );
      var course_id = publishBtn.getAttribute( 'course-id' );
      var data = { 'minilesson_id': minilesson_id, 'course_id': course_id }
      flipper.minilesson.publish( data, function ( err, minilesson ) {
        if ( err ) {
          console.log( err );
          toastr.error( err );
        } else {
          console.log( minilesson );
          toastr.info( 'Minilesson has been published.' );
 
          //location.reload();
        }

      } );
    } );
  } else {
    console.error( 'Missing publish btn.' );
  }



  /* -------------------------------------------------------------------------------------------------------------- */


  var createBtn;

  var minilessonAddDialog = document.querySelector( '#minilesson-add-dialog' );
  if ( minilessonAddDialog ) {

    var course_id = minilessonAddDialog.getAttribute( 'course-id' );

    // Click listener for add-minilesson create button click event
    createBtn = document.querySelector( '#minilesson-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get inputs
        var titleInput = document.querySelector( '#minilesson-add-dialog [title-input]' );
        var dueDate = document.querySelector("#minilesson-add-dialog [due-Date-input]");
        var currentTimeZoneOffsetInMinutes = new Date().getTimezoneOffset();
        var d = new Date( dueDate.value);
        var m = moment( d );
        var dueDateTZ = m.add(currentTimeZoneOffsetInMinutes, "m");
        if ( titleInput) {

          var data = { course_id: course_id, title: titleInput.value, due_date: dueDateTZ};

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
    createBtn = document.querySelector( '#page-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        // Get inputs
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

    var page_id = mcqAddDialog.getAttribute( 'page-id' );

    // Click listener for add-page create button click event
    createBtn = document.querySelector( '#mcq-add-dialog [create]' );
    if ( createBtn ) {
      createBtn.addEventListener( 'click', function () {

        var question = document.querySelector( '#mcq-add-dialog [question-input]' );
        var a = document.querySelector( '#mcq-add-dialog [choiceA-input]' );
        var b = document.querySelector( '#mcq-add-dialog [choiceB-input]' );
        var c = document.querySelector( '#mcq-add-dialog [choiceC-input]' );
        var d = document.querySelector( '#mcq-add-dialog [choiceD-input]' );
        var e = document.querySelector( '#mcq-add-dialog [choiceE-input]' );

        var radio_answer = document.querySelectorAll( '.create-radio-answer' );

        var answers = [];
        var answerObjs = [ a, b, c, d, e ];
        answerObjs.forEach( function ( choice ) {
          if ( choice.value && choice.value.trim() ) {
            answers.push( choice.value );
          }
        } );

        var answer = '';
        forEach( radio_answer, function ( rb, i ) {
          if ( rb.checked ) {
            answer = answers[ i ];
          }
        } );

        var data = {
          page_id: page_id,
          question: question.value,
          answers: answers,
          answer: answer
        };

        flipper.mcq.add( data, function ( err, mcq ) {
          if ( err ) {
            console.error( err );
            toastr.error( err );
          } else {

            // TODO: DO SOMETHING WITH THE PAGE OBJECT?
            console.log( mcq );
            toastr.info( 'Mcq has been added.' );

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

  /* -------------------------------------------------------------------------------------------------------------- */

  var submitMcqBtns = document.querySelectorAll( '[mcq-item] [buttons] [submit]' );

  if ( submitMcqBtns ) {
    forEach( submitMcqBtns, function ( submitMcqBtn ) {
      submitMcqBtn.addEventListener( 'click', function () {

        var mcqItem = submitMcqBtn.parentNode.parentNode;
        var mcq_id = mcqItem.getAttribute( 'mcq-id' );
        var answer = mcqItem.querySelector( 'input[type="radio"][name="student-answer-options"]:checked' );

        if ( mcq_id ) {
          if ( answer ) {

            var data = {
              mcq_id: mcq_id,
              answer: answer.value
            };

            console.log( data );

            flipper.submission.add( data, function ( err, submission ) {
              if ( err ) {
                console.error( err );
                toastr.error( err );
              } else {

                // TODO: DO SOMETHING WITH THE SUBMISSION OBJECT?
                console.log( submission );
                toastr.info( 'Answer has been submitted.' );

                // TODO: WE SHOULDN'T NEED TO REFRESH
                // Refresh for now
                location.reload();

              }
            } );

          } else {
            toastr.error( 'Please select an answer.' );
          }
        } else {
          console.error( 'Missing [mcq-id] or answer.' );
        }

      }, false );
    } );
  } else {
    console.error( 'Missing [mcq-item] [buttons] [submit].' );
  }

} )();
