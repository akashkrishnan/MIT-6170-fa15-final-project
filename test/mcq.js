'use strict';

var MCQ = require( '../models/mcq.js' );
var assert = require( 'assert' );

var question = "Question?"
var emptyString = "";
var emptyList = [];
var oneChoiceList = ["Choice1"];
var manyChoiceList = ["Choice1","Choice2", "Choice3", "Choice4"];

var mcqData = {
    question: question,
    answerChoicesList: manyChoiceList,
    correctChoiceIndex: 0
};


describe( 'MCQ', function () {
    describe( '#add()', function () {
        context('all valid entries', function() {
            it('should add an mcq to database', function (done) {
                MCQ.add(mcqData, function (err) {
                    if (err) throw err;
                    done();
                });
            });
        });
        context('empty string question', function() {
            it('should throw error', function () {
                assert.throws(function () {
                    mcqData.question = emptyString;
                    MCQ.add(mcqData, function (err) {
                        mcqData.question = question;
                        if (err) throw err;
                    });
                }, Error, "Error Thrown");
            })
        });
        context('missing question', function(){
            it('should throw error', function(){
                assert.throws(function(){
                    delete mcqData.question;
                    MCQ.add(mcqData, function(err) {
                        mcqData.question = question;
                        if (err) throw err;
                    });
                }, Error, "Error Thrown")
            })
        })
        context('empty answerChoicesList ', function(){
            it('should throw an error', function(){
                assert.throws(function(){
                    mcqData.answerChoicesList = emptyList;
                    MCQ.add(mcqData, function(err){
                        mcqData.answerChoicesList = manyChoiceList;
                        if (err) throw err;
                    })
                })
            })
        })
        context('one choice answerChoicesList ', function(){
            it('should add mcq to database', function(done){
                mcqData.answerChoicesList = oneChoiceList;
                MCQ.add(mcqData, function(err){
                    mcqData.answerChoicesList = manyChoiceList;
                    if (err) throw err;
                    done();
                })
            })
        })
        context('missing answerChoicesList', function(){
            it('should throw an error', function(){
                assert.throws(function(){
                    delete mcqData.answerChoicesList
                    MCQ.add(mcqData, function(err) {
                        mcqData.answerChoicesList = manyChoiceList;
                        if (err) throw err;
                    })
                })
            })
        })
        context('correctChoiceIndex out of range (Too Large) ', function(){
            it('should throw an error', function(){
                assert.throws(function(){
                    mcqData.correctChoiceIndex = mcqData.answerChoicesList.length;
                    MCQ.add(mcqData, function(err){
                        mcqData.correctChoiceIndex = 0;
                        if (err) throw err;
                    })
                })
            })
        })
        context('correctChoiceIndex out of range (Too Small) ', function(){
            it('should throw an error', function(){
                assert.throws(function(){
                    mcqData.correctChoiceIndex = -1;
                    MCQ.add(mcqData, function(err){
                        mcqData.correctChoiceIndex = 0;
                        if (err) throw err;
                    })
                })
            })
        })

    } );
    describe( '#remove()', function () {
        context('existing object in db with given id', function(){
            it('should remove an mcq from database given valid id', function(){
                MCQ.add(mcqData, function(err, mcq){
                    if (err) throw err;
                    MCQ.remove(mcq, function(err){
                        if (err) throw err;
                    })
                })
            })
        })
        context('no id property', function(){
            it('should throw error', function(){
                assert.throws(function(){
                    MCQ.remove({}, function(err) {
                        if (err) throw err;
                    })
                })
            })
        })
    })
    describe( '#get()', function() {
        context('given valid id', function() {
            it('should get the mcq from database', function(){
                MCQ.add(mcqData, function(err, mcq){
                    if (err) throw err;
                    MCQ.get(mcq, function(err, mcqReturned){
                        if(err) throw err;
                        assert(mcqReturned._id);
                    })
                })
            })
        })
        context('given no id property', function(){
            it('should throw an error', function(){
                assert.throws( function(){
                    MCQ.get({}, function(err){
                        if(err) throw err;
                    });
                }, Error, "Error Thrown")
            })
        })
    })
} );
