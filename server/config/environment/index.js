'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.SESSION_SECRET
  },

  // List of user roles
  userRoles: ['free', 'subscribed', 'admin'],

  // OrientDB connection options
  orientdb: {
    serverhost: process.env.ORIENTDB_SERVERHOST,
    serverport: process.env.ORIENTDB_SERVERPORT,
    serveruser: process.env.ORIENTDB_SERVERUSER,
    serverpass: process.env.ORIENTDB_SERVERPASS,
    dbname:     process.env.ORIENTDB_DBNAME,
    dbuser:     process.env.ORIENTDB_DBUSER,
    dbpass:     process.env.ORIENTDB_DBPASS,
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  meetup: {
    clientID:     process.env.MEETUP_ID || 'id',
    clientSecret: process.env.MEETUP_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/meetup/callback'
  },

  cloudinary: {
    cloudname: process.env.CLOUDINARY_CLOUDNAME,
    apikey: process.env.CLOUDINARY_APIKEY,
    apisecret: process.env.CLOUDINARY_APISECRET
  }

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
