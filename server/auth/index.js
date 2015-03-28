'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');
var auth = require('../auth/auth.service');

// Passport Configuration
require('./meetup/passport').setup(User, config);

var router = express.Router();

router.use('/meetup', require('./meetup'));
router.post('/facebook', function(req, res, next){
  require('./facebook').connectFacebook(req.body.facebookId,
                                        req.body.accessToken,
                                        function(user){
                                          req.user = user;
                                          next();
                                        })
  }, auth.setTokenCookie);

module.exports = router;
