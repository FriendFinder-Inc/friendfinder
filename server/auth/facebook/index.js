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
        		'user_interests',
        		'user_photos',
        		'user_religion_politics',
        		'user_relationships',
        		'user_actions.fitness',
        		'user_actions.music',
        		'user_actions.news',
        		'user_actions.video',
        		'user_actions.books'],
    failureRedirect: '/',
    session: false
  }))

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
