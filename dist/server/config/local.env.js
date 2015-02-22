'use strict';

// Use local.env.js for environment variables that
// grunt will set when the server starts locally.

module.exports = {
  DOMAIN:           'http://localhost:9000',
  SESSION_SECRET:   '4f852039-f5f2-48e6-85dd-67c85ad9b958',

  FACEBOOK_ID:      '204653352912352',
  FACEBOOK_SECRET:  '7dd5f74c78d1daabb6e15905d0757880',

  ORIENTDB_SERVERHOST:      '54.153.12.32',
  ORIENTDB_SERVERPORT:      '2424',
  ORIENTDB_SERVERUSER:      'root',
  ORIENTDB_SERVERPASS:      'testroot',
  ORIENTDB_DBNAME:          'ffdemo',
  ORIENTDB_DBUSER:          'admin',
  ORIENTDB_DBPASS:          'admin',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
