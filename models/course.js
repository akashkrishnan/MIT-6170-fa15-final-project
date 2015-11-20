'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );
var crypto = require( 'crypto' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'courses' ] );

module.exports = {

  /* ---------------EXTERNAL--------------- */

  list: list,
  listForTeacher: listForTeacher,
  listForStudent: listForStudent,
  courseNameExists: courseNameExists,
  get: get,
  getCourseByName: getCourseByName,
  add: add,
  addStudentToCourse: addStudent

};

/**
 * @callback listCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} courses - list of Course objects in the current page
 * @param {number} count - total number of Course objects across all pages
 */

/**
 * Gets a list of Course objects.
 *
 * @param {object} data - data
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.teachers] -
 * @param {boolean} [data.projection.students] -
 * @param {boolean} [data.projection.states] -
 * @param {boolean} [data.projection.timestamps] -
 * @param {number} [data.offset=0] - offset of first Course object in the page
 * @param {number} [data.limit=0] - number of Course objects in a page
 * @param {listCallback} done - callback
 */
function list( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {} );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {
          teachers: { type: 'boolean' },
          students: { type: 'boolean' },
          states: { type: 'boolean' },
          timestamps: { type: 'boolean' }
        },
        filter: 'projection',
        default: {}
      }
    } ).projection;

    var sort = Utils.validateObject( data, {
      sort: {
        type: {},
        default: { courseName: 1 }
      }
    } ).sort;

    db.courses.count( function ( err, count ) {
      if ( err ) {
        done( err, [], 0 );
      } else {
        db.courses
          .find( criteria, projection )
          .sort( sort )
          .skip( data.offset || 0 )
          .limit( data.limit || 0, function ( err, courses ) {
            if ( err ) {
              done( err, [], 0 );
            } else {

              // Return list of courses
              done( null, courses, count );

            }
          } );
      }
    } );

  } catch ( err ) {
    done( err, [], 0 );
  }
}

/**
 * @callback listForTeacherCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} courses - list of Course objects in the current page
 * @param {number} count - total number of Course objects across all pages
 */

/**
 * Gets a list of Course objects with the specified teacher.
 *
 * @param {object} data - data
 * @param {string} data.teacher_id - User._id
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.teachers] -
 * @param {boolean} [data.projection.students] -
 * @param {boolean} [data.projection.states] -
 * @param {boolean} [data.projection.timestamps] -
 * @param {number} [data.offset=0] - offset of first Course object in the page
 * @param {number} [data.limit=0] - number of Course objects in a page
 * @param {listForTeacherCallback} done - callback
 */
function listForTeacher( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      teacher_id: { name: 'teachers', type: 'string', required: true }
    } );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {
          teachers: { type: 'boolean' },
          students: { type: 'boolean' },
          states: { type: 'boolean' },
          timestamps: { type: 'boolean' }
        },
        filter: 'projection',
        default: {}
      }
    } ).projection;

    var sort = Utils.validateObject( data, {
      sort: {
        type: {},
        default: { courseName: 1 }
      }
    } ).sort;

    db.courses.count( criteria, function ( err, count ) {
      if ( err ) {
        done( err, [], 0 );
      } else {
        db.courses
          .find( criteria, projection )
          .sort( sort )
          .skip( data.offset || 0 )
          .limit( data.limit || 0, function ( err, courses ) {
            if ( err ) {
              done( err, [], 0 );
            } else {

              // Return list of courses
              done( null, courses, count );

            }
          } );
      }
    } );

  } catch ( err ) {
    done( err, [], 0 );
  }
}

/**
 * @callback listForStudentCallback
 * @param {Error} err - Error object
 * @param {Array.<object>} courses - list of Course objects in the current page
 * @param {number} count - total number of Course objects across all pages
 */

/**
 * Gets a list of Course objects with the specified student.
 *
 * @param {object} data - data
 * @param {string} data.student_id - User._id
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.teachers] -
 * @param {boolean} [data.projection.students] -
 * @param {boolean} [data.projection.states] -
 * @param {boolean} [data.projection.timestamps] -
 * @param {number} [data.offset=0] - offset of first Course object in the page
 * @param {number} [data.limit=0] - number of Course objects in a page
 * @param {listForStudentCallback} done - callback
 */
function listForStudent( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      student_id: { name: 'students', type: 'string', required: true }
    } );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {
          teachers: { type: 'boolean' },
          students: { type: 'boolean' },
          states: { type: 'boolean' },
          timestamps: { type: 'boolean' }
        },
        filter: 'projection',
        default: {}
      }
    } ).projection;

    var sort = Utils.validateObject( data, {
      sort: {
        type: {},
        default: { courseName: 1 }
      }
    } ).sort;

    db.courses.count( criteria, function ( err, count ) {
      if ( err ) {
        done( err, [], 0 );
      } else {
        db.courses
          .find( criteria, projection )
          .sort( sort )
          .skip( data.offset || 0 )
          .limit( data.limit || 0, function ( err, courses ) {
            if ( err ) {
              done( err, [], 0 );
            } else {

              // Return list of courses
              done( null, courses, count );

            }
          } );
      }
    } );

  } catch ( err ) {
    done( err, [], 0 );
  }
}

/**
 * @callback getCallback
 * @param {Error} err - Error object
 * @param {object} course - Course object
 */

/**
 * Gets a Course object.
 *
 * @param {object} data - data
 * @param {*} data._id - Course._id
 * @param {object} [data.projection] - projection
 * @param {boolean} [data.projection.teachers] -
 * @param {boolean} [data.projection.students] -
 * @param {boolean} [data.projection.states] -
 * @param {boolean} [data.projection.timestamps] -
 * @param {getCallback} done - callback
 */
function get( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId', required: true }
    } );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {
          teachers: { type: 'boolean' },
          students: { type: 'boolean' },
          states: { type: 'boolean' },
          timestamps: { type: 'boolean' }
        },
        filter: 'projection',
        default: {}
      }
    } ).projection;

    db.courses.findOne( criteria, projection, function ( err, course ) {
      if ( err ) {
        done( err, null );
      } else {
        done( null, course );
      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}

function courseNameExists( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId' },
      courseName: { type: 'string' }
    } );

    // Handle different input combinations
    if ( criteria._id ) {
      delete criteria.courseName;
    } else if ( criteria.courseName ) {
      delete criteria._id;
    } else {
      return done( new Error( 'Invalid parameters.' ), false );
    }

    db.courses.findOne( criteria, function ( err, course ) {
      if ( err ) {
        done( err, false );
      } else {
        var courseId = null;
        if ( course ) {
          courseId = course._id;
        }
        done( null, Boolean( course ), courseId );
      }
    } );

  } catch ( err ) {
    done( err, false );
  }
}

function getCourseByName( data, done ) {

  try {

    var criteria = Utils.validateObject( data, {
      courseName: { type: 'string' }
    } );


    db.courses.findOne( criteria, function ( err, course ) {
      if ( err ) {
        done( err, false );
      } else {
        done( null, course );
      }
    } );

  } catch ( err ) {
    done( err, false );
  }

}


function add( data, done ) {
  try {
    var criteria = Utils.validateObject( data, {
      courseName: {
        type: 'string',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
        required: true
      },
      teacher_id: {
        type: 'string',
        required: true
      }
    } );

    courseNameExists( { courseName: criteria.courseName }, function ( err, _exists, course_id ) {
      if ( err ) {
        done( err, null );
      } else if ( _exists ) {
        done( new Error( 'Course Name already exists.' ),
          null
        );
      } else {
        try {
          ///////////////////////////////
          db.courses.insert(
            {
              courseName: criteria.courseName,
              teachers: [ criteria.teacher_id ],
              students: [],
              states: {
                active: true
              },
              timestamps: {
                created: new Date()
              }
            },
            function ( err, course ) {

              if ( err ) {
                done( err, null );
              } else {
                // Get the new user object the proper way
                getCourseByName( { courseName: criteria.courseName }, done );
              }
            }
          );
        } catch ( err ) {
          done( new Error( 'Unable to add course. Please try again.' ), null );
        }

        /////////////////////////////////////
      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}


function addStudent( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      courseName: {
        type: 'string',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
        required: true
      },
      student: {
        type: 'string',
        filter: function ( name ) {
          if ( name ) {
            return name.trim();
          }
        },
        required: true
      }
    } );

    courseNameExists( { courseName: criteria.courseName }, function ( err, _exists, course_id ) {
      if ( err ) {
        done( err, null );
      } else if ( _exists ) {
        try {
          // Insert new student into class
          db.courses.update(
            { _id: course_id },
            { $push: { students: criteria.student } },
            function ( err ) {
              if ( err ) {
                done( err, null );
              } else {
                getCourseByName( { _id: course_id }, done );
              }
            }
          );
        } catch ( err ) {
          done( new Error( 'Unable to add user to course. Please try again.' ), null );
        }
      } else {
        done(
          new Error( 'Course does not exist: ' + JSON.stringify( { name: criteria.courseName } ) + '.' ),
          null
        );
      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}
