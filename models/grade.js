//lead author: Tiffany Wong

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );
var User = require('./user');
var PageObj = require('./pageObj');
var Submission = require('./submission');
var MiniLesson = require('./minilesson');

var db = mongojs( Config.services.db.mongodb.uri, [ 'grades' ] );

module.exports = {

    get: get,
    compute: compute,
    list:list

};

/**
 * Computes and inserts grade.
 *
 * @param {object} data - data
 * @param {string} data.studentId - Grade.studentId
 * @param {string} data.minilessonId - Grade.lessonId
 * @param {addCallback} done - callback
 */
function compute(data, done) {
	var criteria = Utils.validateObject( data, {
      studentId: {
        type: 'string',
        required: true
      },
      minilessonId: {
        type: 'string',
        required: true
      }
    } );

    User.get({_id : criteria.studentId},function(error, user) {
    	if(error) {
    		done(error);
    	}
    	else {
        try{
      		MiniLesson.get({_id : criteria.minilessonId},function(error, minilesson) {
  		    	if(error) {
  		    		done(error);
  		    	} else {
  		    		//TODO: validate that student is in minilesson 
  		    		submission.list(criteria, function(error, submissions) {
  		    			if(error) {
  		    				done(error);
  		    			} else {
  		    				if(submissions.length===0) {
  		    					done(new Error("Cannot compute grade with num submissions = 0"));
  		    				}
  		    				else {
  		    					var sum = 0; //# of correct for minilesson for student
  			    				submissions.forEach(function(submission) {
  			    					sum += submission.correct;
  			    				})

  			    				var grade = sum/submissions.length;

  			    				db.grade.insert(
                        {
                            studentId: criteria.studentId,
                            minilessonId: criteria.minilessonId,
                            grade: grade
                            classId: criteria.minilessonId.classId
                            //TODO: classID: 
                        },
                        function ( err, grade ) {

                            if ( err ) {
                                done( err, null );
                            } else {
                                // Get the new grade object the proper way
                                get( { _id: grade._id }, done );

                            }

                        }
                    );
  		    				}
  		    			}
  		    		});


  		 
  		    	}
  		    });
        
    	} catch ( err ) {
        done( err, null );
      }
    })
}

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} grade - Grade object
 */

/**
 * Gets a Grade object.
 *
 * @param {object} data - data
 * @param {*} [data._id] - Grade._id
 * @param {getCallback} done - callback
 */
function get( data, done ) {
    try {

        var criteria = Utils.validateObject( data, {
            _id: { filter: 'MongoId' },
        } );

        /**
         * Called after grade is found in database.
         *
         * @param {object} criteria -
         */
        var getGrade = function ( criteria ) {

            db.minilessons.findOne( criteria, function ( err, grade ) {
                if ( err ) {
                    done( err, null );
                } else if ( grade ) {
                    done( null, grade );
                } else {
                    done( new Error( 'Grade not found: ' + JSON.stringify( criteria ) ), null );
                }
            } );

        };
        getGrade(criteria);

    } catch ( err ) {
        done( err, null );
    }
}

/**
 * @callback listCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} grades - list of Grade objects in the current page
 * @param {number} count - total number of Grade objects across all pages
 */

/**
 * Gets a list of Grade objects. 
 *
 * @param {object} data - data
 * @param {listCallback} done - callback
 */
function list( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {} );

    var sort = Utils.validateObject( data, {
      sort: {
        type: {},
        default: {}
      }
    } ).sort;

    sort.name = 1;

    db.grades.count( function ( err, count ) {
      if ( err ) {
        done( err, [], 0 );
      } else {
        db.courses
          .find( criteria )
          .sort( sort )
          .skip( data.offset || 0 )
          .limit( data.limit || 0, function ( err, courses ) {
            if ( err ) {
              done( err, [], 0 );
            } else {

              done( null, grades, count );

            }
          } );
      }
    } );

  } catch ( err ) {
    done( err, [], 0 );
  }
}