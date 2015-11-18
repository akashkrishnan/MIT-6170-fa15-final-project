'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'MCQs' ] );

module.exports = {

    get: get,
    add: add,
    remove: remove,

};

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} mcq - MCQ object
 */

/**
 * Gets a MCQ object.
 *
 * @param {object} data - data
 * @param {*} [data._id] - MCQ._id
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

            db.MCQs.findOne( criteria, function ( err, mcq ) {
                if ( err ) {
                    done( err, null );
                } else if ( mcq ) {

                    // Stringify the MongoId
                    mcq._id = mcq._id.toString();

                    done( null, mcq );

                } else {
                    done( new Error( 'MCQ not found: ' + JSON.stringify( criteria ) ), null );
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
 * @param {object} MCQ - newly created MCQ object
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

        validateMCQ(criteria.question, criteria.answerChoicesList, criteria.correctChoiceIndex, function( err ) {
            if ( err ) {
                done( err, null);
            } else {
                db.MCQs.insert(
                    {
                        question: criteria.question,
                        answerChoicesList: criteria.answerChoicesList,
                        correctChoiceIndex: criteria.correctChoiceIndex
                    },
                    function (err, MCQ) {

                        if (err) {
                            done(err, null);
                        } else {
                            // Get the new user object the proper way
                            get({_id: MCQ._id}, done);

                        }

                    }
                );
            }
        });

    } catch ( err ) {
        done( err, null );
    }
}
//Make sure MCQ are semi-well defined.
function validateMCQ(question, answerChoicesList, correctChoiceIndex, done){
    try {
        if (!question) {
            done(new Error('Missing Question'));
        } else if (!answerChoicesList) {
            done(new Error('Missing answer choices list.'));
        } else if (answerChoicesList.length == 0) {
            done(new Error('Answer choices list is empty.'));
        } else if (!correctChoiceIndex) {
            done(new Error('Missing correct choice index'));
        } else if (!(0 <= correctChoiceIndex || correctChoiceIndex < answerChoicesList.length)) {
            done(new Error('Correct choice index out of range'));
        } else {
            done(null);
        }
    } catch(err) {
        done(err);
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