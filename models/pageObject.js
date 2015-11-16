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
        next(criteria);

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
                required: true
            },
            link: {
                type: 'string',
            },
            question: {
                type: 'string',
            },
            answerChoicesList: {
                type: 'array',
            },
            correctChoiceIndex: {
                type: 'number',
            }
        } );

        if(criteria.link) {

            //PageObject is video, so no questions/answers
            delete criteria.question;
            delete criteria.answerChoicesList;
            delete criteria.correctChoiceIndex;

        }

        db.minilessons.insert(
            {
                type: criteria.name,
                link: criteria.state,
                question: criteria.pagesList,
                answerChoicesList: criteria.answerChoicesList,
                correctChoiceIndex: criteria.correctChoiceIndex
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

        // Ensure valid minilesson
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