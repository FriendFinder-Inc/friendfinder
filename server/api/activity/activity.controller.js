'use strict';

var Activity = require('./activity.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

exports.autoComplete = function (req, res, next) {
  Activity.autoComplete(req.query.input, function(suggestions){
    res.json(suggestions);
  });
};

/**
 * Creates a new Activity
 */
exports.create = function (req, res, next) {
  req.body.data.creator = req.user['@rid'];
  req.body.data.creatorfbId = req.user.facebookId;
  var newActivity = new Activity(req.body.data);
  newActivity.create(function(activity){
    res.json(activity)
  });
};

/**
 * Get a single Activity
 */
exports.show = function (req, res, next) {
  var ActivityId = req.params.id;

  Activity.findById(ActivityId, function (err, Activity) {
    if (err) return next(err);
    if (!Activity) return res.send(401);
    res.json(Activity);
  });
};

/**
 * Deletes a Activity
 * restriction: 'admin'
 */
 //TODO
exports.destroy = function(req, res) {
  Activity.findByIdAndRemove(req.params.id, function(err, Activity) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};


/**
 * Most important method of the website!
 */
exports.find = function(req, res, next) {
  Activity.findByFilters(req.query, function(Activitys){
    res.json(Activitys);
  });
};

/**
 * Change properties on Activity object
 */
exports.update = function(req, res, next) {
  Activity.update(req.Activity['@rid'], req.body, function(totalMod){
    res.send(200);
  });
};

/**
 * Bookmark a Activity or activity
 */
exports.bookmark = function(req, res, next) {
  Activity.bookmark(req.Activity['@rid'], req.body.rid, function(res){
    res.send(200);
  });
};

/**
 * Get all bookmarks for Activity
 */
exports.getBookmarks = function(req, res, next) {
  Activity.getAllBookmarks(req.Activity['@rid'], function(bookmarks){
    res.json(bookmarks);
  });
};

/**
 * get mutual fb likes between 2 Activitys
 */
exports.mutualInterests = function(req, res, next) {
  Activity.mutualInterests(req.query.ActivityA, req.query.ActivityB, function(interests){
    res.json(interests);
  });
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  res.json(req.Activity);
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/findfriends');
};
