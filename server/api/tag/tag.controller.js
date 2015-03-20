'use strict';

var _ = require('lodash');
var Tag = require('./tag.model');


// Creates a new tag in the DB.
exports.getAll = function(req, res) {
  Tag.getUserTags(req.user['@rid'], function(tags){
    res.json(tags);
  });
};

// Creates a new tag in the DB.
exports.create = function(req, res) {
  Tag.create(req.body, function(err, tag) {
    if(err) { return handleError(res, err); }
    return res.json(201, tag);
  });
};

// Updates an existing tag in the DB.
exports.update = function(req, res) {
  Tag.update(req.user['@rid'], req.body, function(result){
    res.send(200);
  });
};

// Deletes a tag from the DB.
exports.destroy = function(req, res) {
  Tag.findById(req.params.id, function (err, tag) {
    if(err) { return handleError(res, err); }
    if(!tag) { return res.send(404); }
    tag.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
