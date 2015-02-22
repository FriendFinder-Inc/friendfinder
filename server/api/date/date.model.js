'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DateSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Date', DateSchema);