'use strict';

// Schema for user model
var User = function(params) {
  params = params || {};
  this.props = {};
  this.props.details =     params.details;
  this.props.email =       params.email;
  this.props.facebook =    params.facebook;
  this.props.name =        params.name;
  this.props.preferences = params.preferences;
  this.props.profile =     params.profile;
  this.props.role =        params.role;
};

User.prototype.create = function(cb) {
  db.insert().into('RegisteredUser').set(this.props).one()
  .then(function (user) {
    cb(user);
  });
};

User.findOne = function(params, cb) {
  db.select().from('RegisteredUser').where(params).one()
  .then(function (user) {
    cb(user);
  });
};

// Query db for users that match the filters
// also sort results
User.findByFilters = function(params, cb) {
  db.select('*').from('RegisteredUser').all()
  .then(function (users) {
    cb(users);
  });
};

module.exports = User;
