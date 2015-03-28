/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var oriento = require('oriento');
// var cloudinary = require('cloudinary');
var config = require('./config/environment');

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;

global.sendgrid  = require('sendgrid')(config.sendgrid.username,
                                       config.sendgrid.password);

// Expose db connection
global.db = oriento({host:    config.orientdb.serverhost,
                    port:     config.orientdb.serverport,
                    user:     config.orientdb.serveruser,
                    password: config.orientdb.serverpass
                  })
                    // logger: {
                    //   debug: console.log.bind(console)
                    // }})
            .use({
                name:     config.orientdb.dbname,
                username: config.orientdb.dbuser,
                password: config.orientdb.dbpass
            });

global.cloudinary = require('cloudinary');
cloudinary.config({
                    cloud_name: config.cloudinary.cloudname,
                    api_key: config.cloudinary.apikey,
                    api_secret: config.cloudinary.apisecret
                  });
