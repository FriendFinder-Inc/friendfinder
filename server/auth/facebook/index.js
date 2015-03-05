'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('facebook', {
    scope: ['email',
            'public_profile',
        		'user_friends',
        		'user_location',
        		'user_birthday',
        		'user_likes',
        		'user_photos',
        		'user_hometown',
        		'user_work_history',
        		'user_education_history'],
    failureRedirect: '/',
    session: false
  }))

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
