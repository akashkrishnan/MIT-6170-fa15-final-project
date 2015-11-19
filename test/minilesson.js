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
                done();
            });
        });
    });

    describe( '#get()', function(){
        it( 'gets a minilesson by _id without error', function(done){
            Minilesson.get({_id: minilesson._id}, done);
        });
        it('should return minilesson with correct data in callback', function(done) {
            Minilesson.get({_id: minilesson._id}, function(err, _minilesson) {
                if (err) {
                    done( err );
                } else {
                    assert.equal(_minilesson._id, minilesson._id)
                    assert.equal(_minilesson.name, minilesson.name);
                    assert.equal(_minilesson.state, minilesson.state);
                    done();
                }
            });
        });
    });

    describe( '#addPage', function(){
        it('adds a Page to existing minilesson without error', function(done){
            Minilesson.addPage({_id: minilesson._id, page_id: "0"}, done);
        });
    })

    describe('#removePage', function(){
        it('removes a Page to existing minilesson without error', function(done){
            Minilesson.remove({_id:minilesson._id, page_id: "0"}, done);
        })
    })
});