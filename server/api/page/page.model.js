'use strict';

// Schema for user model
var Page = function(params) {
  params = params || {};
  this.props = {};
  this.props.name =           params.name;
  this.props.category =       params.category;
  this.props.id =             params.id;
};

Page.prototype.create = function(cb) {
  db.insert().into('Page').set(this.props).one()
  .then(function (page) {
    cb(page);
  });
};

Page.findOne = function(params, cb) {
  db.select().from('Page').where(params).one()
  .then(function (page) {
    cb(page);
  });
};

module.exports = Page;
