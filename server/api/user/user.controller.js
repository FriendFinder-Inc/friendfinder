'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Creates a new user
 */
 //TODO
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
 //TODO
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
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
  var user = new User(req.user);
  user.update(req.user['@rid'], req.body, function(user){
    res.send(200);
  });
};

/**
 * Bookmark a user or activity
 */
exports.bookmark = function(req, res, next) {
  User.bookmark(req.user['@rid'], req.body.rid, function(user){
    res.send(200);
  });
};

/**
 * Get all bookmarks for user
 */
exports.getBookmarks = function(req, res, next) {
  User.getAllBookmarks(req.user['@rid'], function(bookmarks){
    res.json(bookmarks);
  });
};

/**
 * get mutual fb likes between 2 users
 */
exports.mutualInterests = function(req, res, next) {
  User.mutualInterests(req.query.userA, req.query.userB, function(interests){
    res.json(interests);
  });
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  res.json(req.user);
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/findfriends');
};
