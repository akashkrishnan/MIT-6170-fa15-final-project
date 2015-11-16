//lead author: Tiffany Wong

var Config = require( '../config.js' );
var Utils = require( './utils.js' );
var mongojs = require( 'mongojs' );

var db = mongojs( Config.services.db.mongodb.uri, [ 'grades' ] );


/**
 * Adds a grade.
 *
 * @param {object} data - data
 * @param {string} data.studentId - Grade.studentId
 * @param {string} data.classId - Grade.classId
 * @param {string} data.period - Grade.period
 * @param {string} data.lessonId - Grade.lessonId
 * @param {string} data.lessonGrade - Grade.lessonGrade
 * @param {addCallback} done - callback
 */
function add( data, done ) {
  try {

    var criteria = Utils.validateObject( data, {
      userId: {
        type: 'string',
        filter: function ( userid ) {
          if ( userid ) {
            return userid.trim();
          }
        },
        required: true
      },
      classid: {
        type: 'string',
        filter: function ( username ) {
          if ( username ) {
            return username.trim();
          }
        },
        required: true
      },
      password: {
        type: 'string',
        filter: function ( password ) {
          if ( password ) {
            return password.trim();
          }
        },
        required: true
      }
    } );

    // Make sure username and password are well-defined
    validateCredentials( criteria.name, criteria.username, criteria.password, function ( err ) {
      if ( err ) {
        done( err, null );
      } else {

        // Ensure username is unique
        exists( { username: criteria.username }, function ( err, _exists ) {
          if ( err ) {
            done( err, null );
          } else if ( _exists ) {
            done(
              new Error( 'User already exists: ' + JSON.stringify( { username: criteria.username } ) + '.' ),
              null
            );
          } else {
            try {

              // Generate cryptographically strong pseudo-random salt
              var salt = crypto.randomBytes( 256 / 8 ).toString( 'hex' );

              // Generate salted hash
              var sha256 = crypto.createHash( 'sha256' );
              sha256.update( salt + criteria.password );
              var saltedPasswordHash = sha256.digest( 'hex' );

              // Insert new user data into database
              db.users.insert(
                {
                  name: criteria.name,
                  username: criteria.username,
                  salt: salt,
                  password: saltedPasswordHash,
                  timestamps: {
                    created: new Date(),
                    lastSigned: null,
                    signed: null,
                    active: null
                  }
                },
                function ( err, user ) {

                  if ( err ) {
                    done( err, null );
                  } else {

                    // Get the new user object the proper way
                    get( { _id: user._id }, done );

                  }

                }
              );

            } catch ( err ) {
              done( new Error( 'Unable to securely add user. Please try again.' ), null );
            }
          }
        } );

      }
    } );

  } catch ( err ) {
    done( err, null );
  }
}
