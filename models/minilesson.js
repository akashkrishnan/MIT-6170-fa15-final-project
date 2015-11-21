'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var User = require( './user.js' );
var Course = require( './course.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'minilessons' ] );

module.exports = {
  list: list,
  get: get,
  add: add,
  remove: remove,
  addPage: addPage,
  removePage: removePage
};

/**
 * @callback listCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} minilessons - list of Minilesson objects in the current page
 * @param {number} count - total number of Minilesson objects across all pages
 */

/**
 * Gets a list of Minilesson objects.
 *
 * @param {object} data - data
 * @param {string} data.user_id - User._id
 * @param {string} data.course_id - Course._id
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.states] -
 * @param {boolean} [data.projection.timestamps] -
 * @param {number} [data.offset=0] - offset of first Minilesson object in the page
 * @param {number} [data.limit=0] - number of Minilesson objects in a page
 * @param {listCallback} done - callback
 */
function list( data, done ) {
  try {

    var userCriteria = Utils.validateObject( data, {
      user_id: { type: 'string', required: true }
    } );

    var listCriteria = Utils.validateObject( data, {
      course_id: { type: 'string', required: true }
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
        default: { 'timestamps.publish': 1 }
      }
    } ).sort;

    var next = function () {

      // Get from database
      db.minilessons.count( listCriteria, function ( err, count ) {
        if ( err ) {
          done( err, [], 0 );
        } else {
          db.minilessons
            .find( listCriteria, projection )
            .sort( sort )
            .skip( data.offset || 0 )
            .limit( data.limit || 0, function ( err, minilessons ) {
              if ( err ) {
                done( err, [], 0 );
              } else {

                // Return list of courses
                done( null, minilessons, count );

              }
            } );
        }
      } );

    };

    // Ensure valid user
    User.get(
      {
        _id: userCriteria.user_id,
        projection: {
          timestamps: false
        }
      },
      function ( err, user ) {
        if ( err ) {
          done( err, [], 0 );
        } else {

          // Ensure user is in the course
          Course.get(
            {
              _id: listCriteria.course_id,
              projection: {
                students: false,
                states: false,
                timestamps: false
              }
            },
            function ( err, course ) {
              if ( err ) {
                done( err, [], 0 );
              } else {

                // TODO: POSSIBLY MOVE THIS INTO THE COURSE MODEL
                // Check type of user in course
                if ( course.teachers.indexOf( user._id ) !== -1 ) {

                  // Teachers can see all minilessons
                  next();

                } else if ( course.students.indexOf( user._id ) !== -1 ) {

                  // Students can only see published minilessons
                  listCriteria[ 'states.published' ] = true;
                  next();

                } else {
                  done( new Error( 'User not associated with course.' ), [], 0 );
                }

              }
            }
          );

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
 * @param {object} minilesson - Minilesson object
 */

/**
 * Gets a Minilesson object.
 *
 * @param {object} data - data
 * @param {*} [data._id] - Minilesson._id
 * @param {getCallback} done - callback
 */
function get( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId' }
    } );

    /**
     * Called after minilesson is found in database.
     *
     * @param {object} criteria -
     */
    var next = function ( criteria ) {

      db.minilessons.findOne( criteria, function ( err, minilesson ) {
        if ( err ) {
          done( err, null );
        } else if ( minilesson ) {

          // Stringify the MongoId
          minilesson._id = minilesson._id.toString();

          done( null, minilesson );

        } else {
          done( new Error( 'Minilesson not found: ' + JSON.stringify( criteria ) ), null );
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
 * @param {object} user - newly created minilesson object
 */

/**
 * Adds a minilesson.
 *
 * @param {object} data - data
 * @param {string} data.name - Minilesson.name
 * @param {string} data.state - Minilesson.state
 * @param {string} data.pagesList - Minilesson.pagesList
 * @param {addCallback} done - callback
 */
function add( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      name: {
        type: 'string',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
        required: true
      },
      state: {
        type: 'string',
        filter: function ( state ) {
          if ( state ) {
            return state.trim();
          }
        },
        required: true
      }
    } );

    db.minilessons.insert(
      {
        name: criteria.name,
        state: criteria.state,
        pagesList: [],
        timestamps: {
          created: new Date(),
        }
      },
      function ( err, minilesson ) {

        if ( err ) {
          done( err, null );
        } else {
          // Get the new user object the proper way
          get( { _id: minilesson._id }, done );

        }

      }
    );

  } catch ( err ) {
    done( err, null );
  }
}

/**
 * @callback removeCallback
 * @param {Error} err - Error object
 * @param {object} minilesson - removed Minilesson object
 */

/**
 * Removes a minilesson from the database.
 *
 * @param {object} data -
 * @param {string} data._id - minilesson._id
 * @param {removeCallback} done - callback
 */
function remove( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true }
    } );

    // Ensure valid minilesson
    get( criteria, function ( err, minilesson ) {
      if ( err ) {
        done( err, null );
      } else {

        // Remove from database
        db.minilessons.remove( criteria, true, function ( err ) {
          if ( err ) {
            done( err, null );
          } else {
            done( null, minilesson );
          }
        } );

      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}

/**
 * @callback addPageCallback
 * @param {Error} err - Error object
 * @param {object} minilesson - Minilesson object
 */

/**
 * Adds a page to minilesson.
 *
 * @param {object} data - data
 * @param {string} data._id - Minilesson._id
 * @param {string} data.page_id - Page._id
 * @param {addCallback} done - callback
 */
function addPage( data, done ) {
  try {
    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true },
      page_id: { type: 'string', required: true }
    } );
    get( { _id: criteria._id }, function ( err, _minilesson ) {
      if ( err ) {
        done( err, null );
      } else {
        db.minilessons.update( { _id: _minilesson._id },
          { $addToSet: { pagesList: criteria.page_id } },
          { upsert: true },
          function ( err ) {
            if ( err ) {
              done( err, null );
            } else {
              // Get the new user object the proper way
              get( { _id: _minilesson._id }, done );
            }
          } );
      }
    } );
  } catch ( err ) {
    done( err, null );
  }
}

/**
 * @callback addPageCallback
 * @param {Error} err - Error object
 * @param {object} minilesson - Minilesson object
 */

/**
 * Removes a page to minilesson.
 *
 * @param {object} data - data
 * @param {string} data._id - Minilesson._id
 * @param {string} data.page_id - Page._id
 * @param {addCallback} done - callback
 */
function removePage( data, done ) {
  try {
    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true },
      page_id: { type: 'string', required: true }
    } );

    get( criteria, function ( err, minilesson ) {
      if ( err ) {
        done( err, null );
      } else {
        db.minilessons.update( minilesson,
          { $pull: { pagesList: criteria.page_id } },
          { upsert: true },
          function ( err ) {
            if ( err ) {
              done( err, null );
            } else {
              // Get the new user object the proper way
              get( { _id: minilesson._id }, done );
            }
          } );
      }
    } );
  } catch ( err ) {
    done( err, null );
  }
}
