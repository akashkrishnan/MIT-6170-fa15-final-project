'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'pages' ] );

module.exports = {

  get: get,
  add: add,
  remove: remove,

};

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} page - Page object
 */

/**
 * Gets a Page object.
 *
 * @param {object} data - data
 * @param {*} [data._id] - page._id
 * @param {getCallback} done - callback
 */
function get( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
        _id: { filter: 'MongoId' },
      } );

        /**
         * Called after MCQ is found in database.
         *
         * @param {object} criteria -
         */
    var next = function ( criteria ) {

        db.pages.findOne( criteria, function ( err, page ) {
            if ( err ) {
                done( err, null );
              } else if ( page ) {

                    // Stringify the MongoId
                  page._id = page._id.toString();

                  done( null, page );

                } else {
                  done( new Error( 'Page not found: ' + JSON.stringify( criteria ) ), null );
                }
          } );

      };
    next(criteria);

  } catch ( err ) {
      done( err, null );
    }
}

/**
 * @callback addCallback
 * @param {Error} err - Error object
 * @param {object} page - newly created Page object
 */

/**
 * Adds a MCQ.
 *
 * @param {object} data - data
 * @param {string} data.question - MCQ.question
 * @param {array} data.answerChoicesList - MCQ.answerChoicesList
 * @param {number} data.correctChoiceIndex - MCQ.correctChoiceIndex
 * @param {addCallback} done - callback
 */
function add( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
        resource: {
            type: 'string',
            filter: function ( name ) {
                if ( name ) {
                    return name.trim();
                  }
              },
          },
        mcqResourceList: {
            type: 'array',
          },
      } );

    validatePage(criteria.resource, criteria.mcqResourceList, function ( err ) {
        if ( err ) {
            done( err, null);
          } else {
            db.pages.insert(
                {
                  resource: criteria.resource,
                  mcqResourceList: criteria.mcqResourceList,
                },
                    function (err, page) {

                      if (err) {
                        done(err, null);
                      } else {
                            // Get the new user object the proper way
                        get({ _id: page._id }, done);

                      }

                    }
                );
          }
      });

  } catch ( err ) {
      done( err, null );
    }
}
//Make sure page are semi-well defined.
function validatePage(resource, mcqResourceList, done) {
  try {
    if (resource === null && mcqResourceList.length === 0) {
        done(new Error('Resources or Questions must be non-empty'));
      } else {
        done(null);
      }
  } catch (err) {
      done(err);
    }
}

/**
 * @callback removeCallback
 * @param {Error} err - Error object
 * @param {object} page - removed Page object
 */

/**
 * Removes a mcq from the database.
 *
 * @param {object} data -
 * @param {string} data._id - page._id
 * @param {removeCallback} done - callback
 */
function remove( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
        _id: { type: 'string', required: true }
      } );

        // Ensure valid mcq
    get( criteria, function ( err, page ) {
        if ( err ) {
            done( err, null );
          } else {

                // Remove from database
            db.pages.remove( criteria, true, function ( err ) {
                if ( err ) {
                    done( err, null );
                  } else {
                    done( null, page );
                  }
              } );

          }
      } );

  } catch ( err ) {
      done( err, null );
    }
}
