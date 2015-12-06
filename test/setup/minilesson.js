'use strict';

var Course = require('../../models/course.js');
var User = require( '../../models/user.js' );

module.exports = function(scope) {
  return function ( done ) {
    // Make sure course is set up
    (require( './course.js' )(scope))( function () {
      console.log(scope);

      scope.nextMonth = new Date();
      scope.nextMonth.setDate(scope.nextMonth.getDate() + 30);
      scope.minilessonTitle = "Kinematics I";
      scope.teacherData.username = "harini2";

      User.add(scope.teacherData, function (err, _user) {
        if (err) {
          throw err;
        }
        scope.user = _user;
        Course.add({
          name: 'courseName10',
          teacher_id: String(scope.user._id)
        }, function (err, _course) {
          if (err) {
            throw err;
          }
          scope.course = _course;
          scope.minilessonData = {
            user_id: String(scope.user._id),
            course_id: String(scope.course._id),
            due_date: scope.nextMonth,
            title: scope.minilessonTitle
          };
          done();
        });
      });
    } );

  };

};
