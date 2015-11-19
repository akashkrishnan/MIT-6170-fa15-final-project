/**
 * Created by medra_000 on 11/18/2015.
 */
'use strict';

var Minilesson = require( '../models/minilesson.js' );
var assert = require( 'assert' );

var minilessonData = {
    name: "Introduction to Kinematics",
    state: "active",
};

var minilesson;

describe( 'Minnilesson', function() {
    describe( '#add()', function() {
        context('all valid entries', function() {
            it('should add a minilesson to database', function(done) {
                Minilesson.add(minilessonData, function(err, _minilesson) {
                    if (err) throw err;
                    minilesson = _minilesson;
                    done();
                })
            });
            it('should return callback with correct data', function(done) {
                assert.equal( minilesson.name, minilessonData.name);
                assert.equal( minilesson.state, minilessonData.state);
                assert.equal( minilesson.pagesList, minilessonData.pagesList);
                done();
            });
        })
    })
})