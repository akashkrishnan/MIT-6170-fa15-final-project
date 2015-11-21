'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var Page = require( './page.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'mcqs' ] );

module.exports = {

  list: list,
  get: get,
  add: add,
  remove: remove

};

/**
 * @callback listCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} mcqs - list of Mcq objects in the current page
 * @param {number} count - total number of Mcq objects across all pages
 */

/**
 * Gets a list of Mcq objects.
 *
 * @param {object} data - data
 * @param {string} data.user_id - User._id
 * @param {string} data.page_id - Page._id
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.timestamps] -
 * @param {number} [data.offset=0] - offset of first Mcq object in the page
 * @param {number} [data.limit=0] - number of Mcq objects in a page
 * @param {listCallback} done - callback
 */
function list( data, done ) {
  try {

    var userCriteria = Utils.validateObject( data, {
      user_id: { type: 'string', required: true }
    } );

    var listCriteria = Utils.validateObject( data, {
      page_id: { type: 'string', required: true }
    } );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {
          timestamps: { type: 'boolean' }
        },
        filter: 'projection',
        default: {}
      }
    } ).projection;

    var sort = Utils.validateObject( data, {
      sort: {
        type: {},
        default: { 'timestamps.created': 1 }
      }
    } ).sort;

    var find = function ( query, projection ) {

      // Get from database
      db.mcqs.count( query, function ( err, count ) {
        if ( err ) {
          done( err, [], 0 );
        } else {
          db.mcqs
            .find( query, projection )
            .sort( sort )
            .skip( data.offset || 0 )
            .limit( data.limit || 0, function ( err, pages ) {
              if ( err ) {
                done( err, [], 0 );
              } else {

                // Return list of pages
                done( null, pages, count );

              }
            } );
        }
      } );

    };

    // Ensure user is associated with the page
    Page.get(
      {
        _id: listCriteria.page_id,
        user_id: userCriteria.user_id,
        projection: {
          timestamps: false
        }
      },
      function ( err ) {
        if ( err ) {
          done( err, [], 0 );
        } else {
          find( listCriteria, projection );
        }
      }
    );

  } catch ( err ) {
    done( err, [], 0 );
  }
}

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} mcq - Mcq object
 * @param {object} course - Course object if a valid user_id was provided
 */

/**
 * Gets an Mcq object.
 *
 * @param {object} data - data
 * @param {string} data._id - Mcq._id
 * @param {string} [data.user_id] - User._id
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.timestamps] -
 * @param {getCallback} done - callback
 */
function get( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId', required: true },
      user_id: { type: 'string' }
    } );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {
          timestamps: { type: 'boolean' }
        },
        filter: 'projection',
        default: {}
      }
    } ).projection;

    var findOne = function ( query, projection, done ) {
      db.mcqs.findOne( query, projection, function ( err, page ) {
        if ( err ) {
          done( err );
        } else if ( page ) {
          done( null, page );
        } else {
          done( new Error( 'Mcq not found.' ), null );
        }
      } );
    };

    // Ensure valid mcq
    findOne( { _id: criteria._id }, projection, function ( err, mcq ) {
      if ( err ) {
        done( err, null, null );
      } else if ( criteria.user_id ) {

        // Ensure user is associated with mcq's page
        Page.get(
          {
            _id: mcq.page_id,
            user_id: criteria.user_id,
            projection: {
              timestamps: false
            }
          },
          function ( err, page, course ) {
            if ( err ) {
              done( err, null, null );
            } else {

              // Teachers can see all mcqs
              done( null, mcq, course );

            }
          }
        );

      } else {
        done( null, mcq, null );
      }
    } );

  } catch ( err ) {
    done( err, null, null );
  }
}

/**
 * @callback addCallback
 * @param {Error} err - Error object
 * @param {object} mcq - Mcq object
 */

/**
 * Adds an mcq.
 *
 * @param {object} data - data
 * @param {string} data.user_id - User._id
 * @param {string} data.page_id - Page._id
 * @param {string} data.question - question
 * @param {Array.<string>} data.answers - answer choices
 * @param {number} data.answer - index of answer choice that is correct
 * @param {addCallback} done - callback
 */
function add( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      user_id: { type: 'string', required: true },
      page_id: { type: 'string', required: true }
    } );

    var insertData = Utils.validateObject( data, {
      page_id: { type: 'string', required: true },
      answers: { required: true },
      answer: { type: 'string', required: true }
    } );

    // TODO: ADD SOME VALIDATION TO ANSWERS AND CORRECTIDX

    // Ensure user is associated with mcq's page
    Page.get(
      {
        _id: criteria.page_id,
        user_id: criteria.user_id,
        projection: {
          timestamps: false
        }
      },
      function ( err, page, course ) {
        if ( err ) {
          done( err, null );
        } else if ( course.teaching ) {

          // Only teachers can add pages
          insertData.timestamps = { created: new Date() };

          // Insert into database
          db.mcqs.insert( insertData, function ( err, mcq ) {
            if ( err ) {
              done( err, null );
            } else {

              // Get the new mcq object the proper way
              get( { _id: mcq._id }, done );

            }
          } );

        } else {
          done( new Error( 'Only teachers can add mcqs to pages.' ), null );
        }
      }
    );

  } catch ( err ) {
    done( err, null );
  }
}

//Make sure MCQ are semi-well defined.
function validateMCQ( question, answerChoicesList, correctChoiceIndex, done ) {
  try {
    if ( !question ) {
      done( new Error( 'Missing Question' ) );
    } else if ( !answerChoicesList ) {
      done( new Error( 'Missing answer choices list.' ) );
    } else if ( answerChoicesList.length === 0 ) {
      done( new Error( 'Answer choices list is empty.' ) );
    } else if ( correctChoiceIndex === null ) {
      done( new Error( 'Missing correct choice index' ) );
    } else if ( !(0 <= correctChoiceIndex) || !(correctChoiceIndex < answerChoicesList.length) ) {
      done( new Error( 'Correct choice index out of range' ) );
    } else if ( correctChoiceIndex % 1 !== 0 ) {
      done( new Error( 'Correct choice index not an integer' ) );
    } else {
      done( null );
    }
  } catch ( err ) {
    done( err );
  }
}

/**
 * @callback removeCallback
 * @param {Error} err - Error object
 * @param {object} mcq - removed MCQ object
 */

/**
 * Removes a mcq from the database.
 *
 * @param {object} data -
 * @param {string} data._id - mcq._id
 * @param {removeCallback} done - callback
 */
function remove( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true }
    } );

    // Ensure valid mcq
    get( criteria, function ( err, MCQ ) {
      if ( err ) {
        done( err, null );
      } else {

        // Remove from database
        db.MCQs.remove( criteria, true, function ( err ) {
          if ( err ) {
            done( err, null );
          } else {
            done( null, MCQ );
          }
        } );

      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}
