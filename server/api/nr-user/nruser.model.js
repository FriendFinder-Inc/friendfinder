'use strict';

// Schema for non registered user model
// TODO: this class will be deprecated after april 30th 2015
var NrUser = function(params) {
  params = params || {};
  this.props = {};
  this.props.name =     params.name;
  this.props.id =       params.id;
};

NrUser.prototype.create = function(cb) {
  db.insert().into('NonregisteredUser').set(this.props).one()
  .then(function (user) {
    cb(user);
  });
};

NrUser.findOne = function(params, cb) {
  db.select().from('NonregisteredUser').where(params).one()
  .then(function (user) {
    cb(user);
  });
};

module.exports = NrUser;
