/**
 * Created by medra_000 on 12/4/2015.
 */

'use strict';

var Page = require( '../models/page.js' );
var User = require( '../models/user.js' );
var Minilesson = require( '../models/minilesson.js' );
var Course = require( '../models/course.js' );
var assert = require( 'assert' );


var user;
var course;
var minilesson;
var pageTitle = "Page Title";
var pageResource = "www.flipperSwag.com";

var data;
var page;

describe( 'Page', function() {
    //Setup: Create User, Course, Minilesson
    before(function (done) {
        User.add({
            name: 'Person Name',
            username: 'usernam9',
            password: 'username15MIT!'
        }, function (err, _user) {
            if (err) {
                throw err;
            }
            user = _user;
            Course.add({
                name: 'courseName10',
                teacher_id: user._id
            }, function (err, _course) {
                if (err) {
                    throw err;
                }
                course = _course;
                Minilesson.add({
                    user_id: user._id,
                    course_id: String(course._id),
                    due_date: new Date(),
                    title: 'Title'
                }, function (err, _minilesson) {
                    if (err) {
                        throw err;
                    }
                    minilesson = _minilesson;
                    data = {
                        user_id: String(user._id),
                        minilesson_id: String(minilesson._id),
                        title: pageTitle,
                        resource: pageResource
                    };
                    done();
                });
            });
        });
    });


    describe('#add', function () {
        context('all valid entries', function () {
            it('should add a page to database', function (done) {
                Page.add(data, function (err, _page) {
                    if (err) {
                        throw err;
                    }
                    page = _page;
                    done();
                })
            });
            it('should return page with correct data', function () {
                assert.equal( page.minilesson_id, data.minilesson_id);
                assert.equal( page.title, data.title);
                assert.equal( page.resource, data.resource);
            });
        });

        context('all valid entries (no resource)', function () {
            it('should add a page to database', function (done) {

                delete data.resource;
                Page.add( data, function(err, _page) {
                    data.resource = pageResource;
                    if(err) {
                        throw err;
                    }
                    page = _page;
                    done();
                });
            });
            it('should return page with correct data', function () {
                assert.equal( page.minilesson_id, data.minilesson_id);
                assert.equal( page.title, data.title);
                assert.equal( page.resource, undefined);
            });
        });

        context('no user_id', function () {
            it('should throw an error', function (done) {
                 assert.throws(function() {
                    delete data.user_id;
                    Page.add(data, function (err) {
                        data.user_id = user.user_id;
                        if (err) {
                            throw err
                        }
                    });
                 });
                 done();
            })
        });

        context('no minilesson_id', function () {
            it('should throw an error', function (done) {
                assert.throws(function() {
                    delete data.minilesson_id;
                    Page.add(data, function (err) {
                        data.minilesson_id = String(minilesson._id);
                        if (err) {
                            throw err
                        }
                    });
                });
                done();
            })
        });

        context('no title', function () {
            it('should throw an error', function (done) {
                assert.throws(function() {
                    delete data.title;
                    Page.add(data, function (err) {
                        data.title = pageTitle;
                        if (err) {
                            throw err
                        }
                    });
                });
                done();
            })
        });
    });

    describe('#get', function () {
        context('single page _id argument', function() {
            it('should get a page without error', function(done){
                Page.get({_id: page._id}, done);
            });
            it('should get a page with correct data', function(done){
                Page.get({_id: page._id}, function(err, _page){
                    if(err){
                        done(err);
                    } else {
                        assert.equal(page.minilesson_id, _page.minilesson_id);
                        assert.equal(page.title, _page.title);
                        assert.equal(page.resource, _page.resource);
                        done();
                    }
                });
            });
        });
    });

    describe('#list', function () {
        context('user_id and minilesson_id arguments', function(){
            it('should return list of pages without error', function(done){
                Page.list({user_id: user._id,
                    minilesson_id: String(minilesson._id)}, done);
            });
        })
    });

    describe('#remove', function () {
        context('valid page_id', function(){
            it('should remove page without error', function(done){
                Page.remove({_id: page._id}, done);
            });
        });
    });
});