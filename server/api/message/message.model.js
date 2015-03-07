'use strict';

// Schema for message model
var Message = function(params) {
  params = params || {};
  this.props = {};
  this.props.sender =     params.sender;
  this.props.recipient =  params.recipient;
  this.props.read =       params.read;
  this.props.content =    params.content;
};

// utility function
var createEdge = function(from, to, type){
  var fromRid = '#'+from['@rid'].cluster+':'+from['@rid'].position;
  var toRid = '#'+to['@rid'].cluster+':'+to['@rid'].position;
  db.create('EDGE', type)
  .from(fromRid)
  .to(toRid)
  .one()
  .then(function (edge) {
  });
};

Message.prototype.create = function(cb) {
  db.insert().into('Message').set(this.props).one()
  .then(function (message) {
    cb(message);
  });
};

Message.prototype.send = function(cb) {
  var self = this;
  db.select().from('RegisteredUser').where({'facebook.id': self.props.sender}).one()
  .then(function(sender){
    db.select().from('RegisteredUser').where({'facebook.id': self.props.recipient}).one()
    .then(function(recipient){
      db.insert().into('Message').set(self.props).one()
      .then(function (message) {
        createEdge(sender, message, 'sent');
        createEdge(recipient, message, 'received');
        cb(message);
      });
    });
  });
};

Message.findOne = function(params, cb) {
  db.select().from('Message').where(params).one()
  .then(function (message) {
    cb(message);
  });
};

Message.findByFilters = function(params, cb) {
  db.select().from('Message').where(params).all()
  .then(function (messages) {
    cb(messages);
  });
};

Message.getAll = function(userId, cb) {
  db.query('').all()
  .then(function (messages) {
    cb(messages);
  });
};

Message.getSent = function(userId, cb) {
  db.query("select gremlin(it.out('sent')) from RegisteredUser where 'facebook.id' = "+userId).all()
  .then(function (messages) {
    cb(messages);
  });
};

Message.getReceived = function(userId, cb) {
  db.query("select gremlin(it.out('received')) from RegisteredUser where 'facebook.id' = "+userId).all()
  .then(function (messages) {
    cb(messages);
  });
};

module.exports = Message;
