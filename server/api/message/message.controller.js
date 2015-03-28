'use strict';

var _ = require('lodash');
var Message = require('./message.model');

// get all messages for a user
exports.all = function(req, res) {
  Message.getAll(req.user['@rid'], function(threads){
    res.json(threads);
  });
};

// send a message to a user
exports.send = function(req, res) {
  var message = new Message(req.body);
  message.send(function (message) {
    if(!message) { return res.send(404); }
    sendgrid.send({
      to:       req.body.toEmail,
      from:     'noreply@friendfinder.io',
      subject:  'friendfinder.io - new message!',
      text:     req.body.content
    }, function(err, json) {
      if (err) {
        console.log('SENDGRID API ERROR: failed to send message ', message['@rid'], err);
        return res.send(404);
      }
      console.log('sent')
      return res.send(200);
    });
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
