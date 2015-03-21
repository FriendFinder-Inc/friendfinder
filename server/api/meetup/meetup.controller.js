'use strict';

var _ = require('lodash');
var Meetup = require('./Meetup.model');


// Creates a new Meetup in the DB.
exports.getAll = function(req, res) {
  Meetup.getUserMeetups(req.user['@rid'], function(Meetups){
    res.json(Meetups);
  });
};

// Creates a new Meetup in the DB.
exports.create = function(req, res) {
  Meetup.create(req.body, function(err, Meetup) {
    if(err) { return handleError(res, err); }
    return res.json(201, Meetup);
  });
};

// Updates an existing Meetup in the DB.
exports.update = function(req, res) {
  Meetup.update(req.user['@rid'], req.body, function(result){
    res.send(200);
  });
};

// Deletes a Meetup from the DB.
exports.destroy = function(req, res) {
  Meetup.findById(req.params.id, function (err, Meetup) {
    if(err) { return handleError(res, err); }
    if(!Meetup) { return res.send(404); }
    Meetup.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
