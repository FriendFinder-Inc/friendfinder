'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};


/**
 * Get a single user
 */
exports.get = function (req, res, next) {
  User.getById(req.query.rid, function (user) {
    res.json(user);
  });
};


exports.delete = function(req, res) {
  User.delete(req.query.rid, function(user) {
    return res.json(user);
  });
};


/**
 * Most important method of the website!
 */
exports.find = function(req, res, next) {
  User.findByFilters(req.query, function(users){
    res.json(users);
  });
};

/**
 * Change properties on user object
 */
exports.update = function(req, res, next) {
  User.update(req.user['@rid'], req.body, function(totalMod){
    res.send(totalMod);
  });
};

/**
 * Bookmark a user or activity
 */
exports.bookmark = function(req, res, next) {
  User.bookmark(req.user['@rid'], req.body.rid, function(response){
    res.send(200);
  });
};

exports.removeBookmark = function(req, res, next) {
  User.removeBookmark(req.user['@rid'], req.query.rid, function(response){
    res.send(200);
  });
};

exports.removeMeetups = function(req, res, next) {
  User.removeMeetups(req.user['@rid'], req.query.rids, function(response){
    res.send(200);
  });
};

exports.getBookmarks = function(req, res, next) {
  User.getEdge('bookmarked', req.user['@rid'], function(bookmarks){
    res.json(bookmarks);
  });
};

exports.getRequests = function(req, res, next) {
  User.getEdge('requested', req.user['@rid'], function(requests){
    res.json(requests);
  });
};

exports.getInterests = function(req, res, next) {
  User.getEdge('likes', req.query.rid, function(interests){
    res.json(interests);
  });
};

exports.getMeetups = function(req, res, next) {
  User.getEdge('member', req.query.rid, function(meetups){
    res.json(meetups);
  });
};

exports.mutualInterests = function(req, res, next) {
  User.getMutual("likes", req.user['@rid'], req.query.rid, function(mutual){
    res.json(mutual);
  });
};

exports.mutualFriends = function(req, res, next) {
  User.getMutual("friends", req.user['@rid'], req.query.rid, function(mutual){
    res.json(mutual);
  });
};

exports.mutualMeetups = function(req, res, next) {
  User.getMutual("member", req.user['@rid'], req.query.rid, function(mutual){
    res.json(mutual);
  });
};

exports.connectionPath = function(req, res, next) {
  User.getConnectionPath(req.user['@rid'], req.query.rid, function(mutual){
    res.json(mutual);
  });
};

exports.me = function(req, res, next) {
  res.json(req.user);
};
