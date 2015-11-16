'use strict';

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );
var crypto = require( 'crypto' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'courses' ] );

module.exports = {

  /* ---------------EXTERNAL--------------- */

  list: list,
  courseNameExists: courseNameExists,
  add: add,
  getCoursesForStudent: getCoursesForStudent,
  getCoursesForTeacher: getCoursesForTeacher,
  getCourseByName: getCourseByName

};


function list( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {} );

    var projection = Utils.validateObject( data, {
      projection: {
        type: {},
        filter: 'projection',
        default: {}
      }
    } ).projection;

  
    var sort = Utils.validateObject( data, {
      sort: {
        type: {},
        default: {}
      }
    } ).sort;

    sort.name = 1;

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

              // Return list of users
              done( null, courses, count );

            }
          } );
      }
    } );

  } catch ( err ) {
    done( err, [], 0 );
  }
}

function courseNameExists( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      _id: { filter: 'MongoId' },
      courseName: { type: 'string' },
    } );

    // Handle different input combinations
    if ( criteria._id ) {
      delete criteria.courseName;
    } else if ( criteria.courseName ) {
      delete criteria._id;
    } else {
      return done( new Error( 'Invalid parameters.' ), false );
    }

    db.users.findOne( criteria, function ( err, course ) {
      if ( err ) {
        done( err, false );
      } else {
        done( null, Boolean( course ) );
      }
    } );

  } catch ( err ) {
    done( err, false );
  }
}

function getCoursesForStudent ( data, done ) {  
  try {
    db.courses.find({'students.student_id' : { $eq: data['user_id']}}, function( err, courses ) {
      if ( err ) {
        done( err, null );
      } else {
        done ( null, courses );
      }
    });
  } catch (err) {
    done (err, false);
  }
}

function getCoursesForTeacher ( data, done ) {
  try {
    db.courses.find({'teachers' : { $eq: data['user_id']}}, function( err, courses ) {
      if ( err ) {
        done( err, null );
      } else {
        done ( null, courses );
      }
    });
  } catch (err) {
    done ( err, false );
  }
}

function getCourseByName ( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      courseName: { type: 'string' },
    } );

    db.users.findOne( criteria, function ( err, course ) {
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
      teacher_id {
        type: 'string',
        required: true
      }
    });

    exists( { name: criteria.courseName }, function ( err, _exists ) {
          if ( err ) {
            done( err, null );
          } else if ( _exists ) {
            done(
              new Error( 'Course Name already exists: ' + JSON.stringify( { name: criteria.courseName } ) + '.' ),
              null
            );
          } else {
            try {
              // Insert new user data into database
              db.courses.insert(
                {
                  name: criteria.courseName,
                  teachers: [criteria.teacher_id],
                  students: [],
                  minilessons: [],
                  timestamps: {
                    created: new Date(),
                  },
                  states: {
                    active: true,
                  }
                },
                function ( err, course ) {

                  if ( err ) {
                    done( err, null );
                  } else {
                    // Get the new user object the proper way
                    get( { _id: course._id }, done );
                  }
                }
              );
            } catch ( err ) {
              done( new Error( 'Unable to add class. Please try again.' ), null );
            }
          }
        } );

  } catch ( err ) {
    done( err, null );
  }
}


