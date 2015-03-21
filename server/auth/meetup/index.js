'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', auth.isAuthenticated(), function(req, res, next){
    req.session.rid = req.user['@rid']
    passport.authenticate('meetup',
    {
      scope: [],
      failureRedirect: '/settings/account',
      session: false,
    })(req, res, next);
  })
  .get('/callback', passport.authenticate('meetup',
    {
      failureRedirect: '/settings/account',
      session: false
    }), function(req, res){
      res.redirect('/settings/account')
  });

module.exports = router;
