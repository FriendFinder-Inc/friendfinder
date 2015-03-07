'use strict';

var _ = require('lodash');
var Message = require('./message.model');

// get all messages for a user
exports.all = function(req, res) {
  Message.getAll(req.query.userId, function(messages){
  });
};

// get all sent messages for a user
exports.sent = function(req, res) {
  Message.getSent(req.query.userId, function(messages){
    console.log('wow', messages)
  });
};

// get all received messages for a user
exports.received = function(req, res) {
  Message.getReceived(req.query.userId, function(messages){
    console.log('wow', messages)
  });
};

// send a message to a user
exports.send = function(req, res) {
  var message = new Message(req.body);
  message.send(function (message) {
    if(!message) { return res.send(404); }
    return res.send(200);
  });
};

// Get a single message
exports.show = function(req, res) {
  Message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.send(404); }
    return res.json(message);
  });
};

// Creates a new message in the DB
exports.create = function(req, res) {
  Message.create(req.body, function(err, message) {
    if(err) { return handleError(res, err); }
    return res.json(201, message);
  });
};
