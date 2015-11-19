'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'minilessons' ] );

module.exports = {

  get: get,
  add: add,
  remove: remove,
  addPage: addPage,
  removePage: removePage,
};


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
      _id: { filter: 'MongoId' },
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
function addPage( data, done) {
  try{
    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true },
      page_id: { type: 'string', required: true}
    } );
    get( {_id : criteria._id}, function(err, _minilesson) {
      if (err) {
        done(err, null);
      } else {
        db.minilessons.update({_id:_minilesson._id},
            {$addToSet: {pagesList: criteria.page_id}},
            {upsert: true},
            function (err) {
              if (err) {
                done(err, null);
              } else {
                // Get the new user object the proper way
                get({_id: _minilesson._id}, done);
              }
            });
      }
    });
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
function removePage( data, done) {
  try{
    var criteria = Utils.validateObject( data, {
      _id: { type: 'string', required: true },
      page_id: { type: 'string', required: true}
    } );

    get( criteria, function(err, minilesson) {
      if (err) {
        done(err, null);
      } else {
        db.minilessons.update(minilesson,
            {$pull: {pagesList: criteria.page_id}},
            {upsert: true},
            function (err) {
              if (err) {
                done(err, null);
              } else {
                // Get the new user object the proper way
                get({_id: minilesson._id}, done);
              }
            });
      }
    });
  } catch ( err ) {
    done( err, null );
  }
}