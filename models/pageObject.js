'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'pageObjects' ] );

module.exports = {

  get: get,
  add: add,
  remove: remove,

};
var videoTypeString = "video";
var mcqTypeString = "mcq";

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} pageObject - PageObject object
 */

/**
 * Gets a PageObject object.
 *
 * @param {object} data - data
 * @param {*} [data._id] - PageObject._id
 * @param {getCallback} done - callback
 */
function get( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId' },
    } );

    /**
     * Called after pageObject is found in database.
     *
     * @param {object} criteria -
     */
    var next = function ( criteria ) {

      db.pageObjects.findOne( criteria, function ( err, pageObject ) {
        if ( err ) {
          done( err, null );
        } else if ( pageObject ) {

          // Stringify the MongoId
          pageObject._id = pageObject._id.toString();

          done( null, pageObject );

        } else {
          done( new Error( 'PageObject not found: ' + JSON.stringify( criteria ) ), null );
        }
      } );

    };
    next( criteria );

  } catch ( err ) {
    done( err, null );
  }
}

/**
 * @callback addCallback
 * @param {Error} err - Error object
 * @param {object} pageObject - newly created PageObject object
 */

/**
 * Adds a pageObject.
 *
 * @param {object} data - data
 * @param {string} data.type - PageObject.type
 * @param {string} data.link - PageObject.link
 * @param {string} data.question - PageObject.question
 * @param {array} data.answerChoicesList - PageObject.answerChoicesList
 * @param {number} data.correctChoiceIndex - PageObject.correctChoiceIndex
 * @param {addCallback} done - callback
 */
function add( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      type: {
        type: 'string',
        filter: function ( type ) {
          if ( type ) {
            return type.trim();
          }
        },
        required: true
      },
      link: {
        type: 'string',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
      },
      question: {
        type: 'string',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
      },
      answerChoicesList: {
        type: 'array',
      },
      correctChoiceIndex: {
        type: 'number',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
      }
    } );

    if ( criteria.type == videoTypeString ) {
      //PageObject type is video, so no questions/answers
      delete criteria.question;
      delete criteria.answerChoicesList;
      delete criteria.correctChoiceIndex;

      if ( !criteria.link ) {
        done( new Error( 'Type is video but no Video Link' ) );
      } else if ( criteria.link ) {
        db.pageObjects.insert(
          {
            type: criteria.name,
            link: criteria.state
          },
          function ( err, pageObject ) {

            if ( err ) {
              done( err, null );
            } else {
              // Get the new user object the proper way
              get( { _id: pageObject._id }, done );

            }

          }
        );
      }
    } else if ( criteria.type == mcqTypeString ) {
      //PageObject type is video so no link
      delete criteria.link;

      validateMCQ( criteria.question, criteria.answerChoicesList, criteria.correctChoiceIndex, function ( err ) {
        if ( err ) {
          done( err, null );
        } else {
          db.pageObjects.insert(
            {
              type: criteria.name,
              question: criteria.pagesList,
              answerChoicesList: criteria.answerChoicesList,
              correctChoiceIndex: criteria.correctChoiceIndex
            },
            function ( err, pageObject ) {

              if ( err ) {
                done( err, null );
              } else {
                // Get the new user object the proper way
                get( { _id: pageObject._id }, done );

              }

            }
          );
        }
      } );
    } else {
      done( new Error( 'Not a valid type' ) )
    }

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
    } else if ( answerChoicesList.length == 0 ) {
      done( new Error( 'Answer choices list is empty.' ) );
    } else if ( !correctChoiceIndex ) {
      done( new Error( 'Missing correct choice index' ) );
    } else if ( !(0 <= correctChoiceIndex || correctChoiceIndex < answerChoicesList.length) ) {
      done( new Error( 'Correct choice index out of range' ) );
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
 * @param {object} pageObject - removed PageObject object
 */

/**
 * Removes a pageObject from the database.
 *
 * @param {object} data -
 * @param {string} data._id - pageObject._id
 * @param {removeCallback} done - callback
 */
function remove( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true }
    } );

    // Ensure valid pageObject
    get( criteria, function ( err, pageObject ) {
      if ( err ) {
        done( err, null );
      } else {

        // Remove from database
        db.pageObjects.remove( criteria, true, function ( err ) {
          if ( err ) {
            done( err, null );
          } else {
            done( null, pageObject );
          }
        } );

      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}
