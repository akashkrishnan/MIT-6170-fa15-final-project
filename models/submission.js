/**
 * AUTHOR: Akash Krishnan <ak@aakay.net>
 */

'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var User = require( './user.js' );
var Class = require( './class.js' );
var Minilesson = require( './minilesson.js' );
var PageObj = require( './mcq.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'submissions' ] );

module.exports = {

  /* ---------------EXTERNAL--------------- */

  list: list,
  get: get,
  add: add

};

/**
 * @callback listCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} submissions - list of Submission objects
 * @param {number} count - total number of Submission objects
 */

/**
 * Gets a list of Submission objects.
 *
 * @param {object} data - data
 * @param {string} [data.classId] - Class._id
 * @param {number} [data.sectionNum] - section number in class
 * @param {string} [data.minilessonId] - Minilesson._id
 * @param {string} [data.pageObjId] - PageObj._id
 * @param {string} [data.studentId] - User._id
 * @param {listCallback} done - callback
 */
function list( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      classId: { type: 'string' },
      sectionNum: { type: 'number' },
      minilessonId: { type: 'string' },
      pageObjId: { type: 'string' },
      studentId: { type: 'string' }
    } );

    // Ensure at least one parameter is available
    if ( 'classId' in criteria ||
         'sectionNum' in criteria ||
         'minilessonId' in criteria ||
         'pageObjId' in criteria ||
         'studentId' in criteria ) {

      // Get Submission objects from database
      db.submissions.find( criteria, function ( err, submissions ) {
        if ( err ) {
          done( err, [], 0 );
        } else {
          done( null, submissions, submissions.length );
        }
      } );

    } else {
      done( new Error( 'Invalid parameters.' ), [], 0 );
    }

  } catch ( err ) {
    done( err, [], 0 );
  }
}

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} submission - Submission object
 */

/**
 * Gets a Submission object.
 *
 * @param {object} data - data
 * @param {*} [data._id] - Submission._id
 * @param {string} [data.classId] - Class._id
 * @param {number} [data.sectionNum] - section number in class
 * @param {string} [data.minilessonId] - Minilesson._id
 * @param {string} [data.pageObjId] - PageObj._id
 * @param {string} [data.studentId] - User._id
 * @param {getCallback} done - callback
 */
function get( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId' },
      classId: { type: 'string' },
      sectionNum: { type: 'number' },
      minilessonId: { type: 'string' },
      pageObjId: { type: 'string' },
      studentId: { type: 'string' }
    } );

    // Ensure at least one parameter is available
    if ( criteria._id ||
         'classId' in criteria ||
         'sectionNum' in criteria ||
         'minilessonId' in criteria ||
         'pageObjId' in criteria ||
         'studentId' in criteria ) {

      // Get Submission object from database
      db.submissions.findOne( criteria, function ( err, submission ) {
        if ( err ) {
          done( err, null );
        } else if ( submission ) {
          done( null, submission );
        } else {
          done( new Error( 'Submission not found.' ), null );
        }
      } );

    } else {
      done( new Error( 'Invalid parameters.' ), null );
    }

  } catch ( err ) {
    done( err, null );
  }
}

/**
 * @callback addCallback
 * @param {Error} err - Error object
 * @param {object} submission - newly created Submission object
 */

/**
 * Adds a Submission.
 *
 * @param {object} data - data
 * @param {string} data.classId - Class._id
 * @param {number} data.sectionNum - section number in class
 * @param {string} data.minilessonId - Minilesson._id
 * @param {string} data.pageObjId - PageObj._id
 * @param {string} data.studentId - User._id
 * @param {number} data.answerIdx - the student's answer as an index of the answer choices
 * @param {addCallback} done - callback
 */
function add( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      classId: { type: 'string', required: true },
      sectionNum: { type: 'number', required: true },
      minilessonId: { type: 'string', required: true },
      pageObjId: { type: 'string', required: true },
      studentId: { type: 'string', required: true },
      answerIdx: { type: 'number', required: true }
    } );

    // Ensure there is no previous submission. err is truthy if a submission does not exist.
    get( criteria, function ( err ) {
      if ( err ) {

        // Ensure valid user
        User.get( { _id: criteria.studentId }, function ( err ) {
          if ( err ) {
            done( err, null );
          } else {

            // Ensure valid pageObj
            PageObj.get( { _id: criteria.pageObjId, type: 'MCQ' }, function ( err, pageObj ) {
              if ( err ) {
                done( err, null );
              } else {

                // Ensure valid minilesson
                Minilesson.get( { _id: criteria.minilessonId }, function ( err ) {
                  if ( err ) {
                    done( err, null );
                  } else {

                    // Ensure user is a student in the class section
                    Class.get(
                      {
                        _id: criteria.classId,
                        student: {
                          userId: criteria.studentId,
                          sectionNum: criteria.sectionNum
                        }
                      },
                      function ( err ) {
                        if ( err ) {
                          done( err, null );
                        } else {

                          // NOTE: WE DO NOT CHECK IF THE MINILESSON IS ASSOCIATED WITH THE CLASS
                          // NOTE: WE DO NOT CHECK IF THE PAGEOBJ IS ASSOCIATED WITH THE CLASS

                          // Compute score based on correctness (and possibly weight in the future)
                          var score = criteria.answerIdx === pageObj.answerIdx;

                          // Insert submission into database
                          db.submissions.insert(
                            {
                              'classId': criteria.classId,
                              'sectionNum': criteria.sectionNum,
                              'minilessonId': criteria.minilessonId,
                              'pageObjId': criteria.pageObjId,
                              'studentId': criteria.studentId,
                              'answerIdx': criteria.answerIdx,
                              'score': score,
                              'timestamps.created': new Date()
                            },
                            function ( err, submission ) {
                              if ( err ) {
                                done( err, null );
                              } else {

                                // Get the new Submission object the proper way to maintain consistency
                                get( { _id: submission._id }, done );

                              }
                            }
                          );

                        }
                      }
                    );

                  }
                } );

              }
            } );

          }
        } );

      } else {
        done( new Error( 'Submission already exists. Only one submission is permitted.' ), null );
      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}
