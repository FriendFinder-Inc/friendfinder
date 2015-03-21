'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');
var auth = require('../auth/auth.service');

// Passport Configuration
require('./facebook/passport').setup(User, config);
require('./meetup/passport').setup(User, config);

var router = express.Router();

router.use('/facebook', require('./facebook'));
router.use('/meetup', require('./meetup'));

module.exports = router;
