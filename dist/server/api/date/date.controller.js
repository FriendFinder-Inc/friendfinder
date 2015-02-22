'use strict';

var _ = require('lodash');
var Date = require('./date.model');

// Get list of dates
exports.index = function(req, res) {
  Date.find(function (err, dates) {
    if(err) { return handleError(res, err); }
    return res.json(200, dates);
  });
};

// Get a single date
exports.show = function(req, res) {
  Date.findById(req.params.id, function (err, date) {
    if(err) { return handleError(res, err); }
    if(!date) { return res.send(404); }
    return res.json(date);
  });
};

// Creates a new date in the DB.
exports.create = function(req, res) {
  Date.create(req.body, function(err, date) {
    if(err) { return handleError(res, err); }
    return res.json(201, date);
  });
};

// Updates an existing date in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Date.findById(req.params.id, function (err, date) {
    if (err) { return handleError(res, err); }
    if(!date) { return res.send(404); }
    var updated = _.merge(date, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, date);
    });
  });
};

// Deletes a date from the DB.
exports.destroy = function(req, res) {
  Date.findById(req.params.id, function (err, date) {
    if(err) { return handleError(res, err); }
    if(!date) { return res.send(404); }
    date.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}