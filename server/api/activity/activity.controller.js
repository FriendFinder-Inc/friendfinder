'use strict';

var Activity = require('./activity.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

exports.autoComplete = function (req, res, next) {
  Activity.autoComplete(req.query.input, req.query.latlong, function(suggestions){
    res.json(suggestions);
  });
};

/**
 * Creates a new Activity
 */
exports.create = function (req, res, next) {
  req.body.data.creator = req.user['@rid'];
  req.body.data.creatorFbId = req.user.facebookId;
  req.body.data.creatorName = req.user.name.split(' ')[0];
  var newActivity = new Activity(req.body.data);
  newActivity.create(function(activity){
    res.json(activity)
  });
};

/**
 * Get a single Activity
 */
exports.getMine = function (req, res, next) {
  Activity.getAll(req.user['@rid'], function (activities) {
    if (!activities) return res.send(401);
    res.json(activities);
  });
};

/**
 * Get a single Activity
 */
exports.get = function (req, res, next) {
  Activity.getAll(req.query.rid, function (activities) {
    if (!activities) return res.send(401);
    res.json(activities);
  });
};

exports.request = function (req, res, next) {
  Activity.request(req.user['@rid'], req.body.rid, function(response){
    //send email to owner
    db.query('select email from '+req.body.owner)
    .then(function(data){
      var name = req.user.name.split(' ')[0];
      sendgrid.send({
        to:       data[0].email,
        from:     'noreply@friendfinder.io',
        fromname: 'friendfinder',
        subject:  'New join request from '+name,
        text:     name+' wants to join your activity: '+req.body.activityTitle
      }, function(err, json) {
        if (err) {
          console.log('SENDGRID API ERROR: failed to send message ', err);
          return res.send(404);
        }
        return res.send(200);
      });
    });
  });
};

/**
 * Deletes a Activity
 */
exports.delete = function(req, res) {
  // can only delete our own activities
  if(req.body.owner != req.user['@rid']){
    res.send(401);
  } else {
    Activity.delete(req.body.rid, function(result) {
      return res.json(result);
    });
  }
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
