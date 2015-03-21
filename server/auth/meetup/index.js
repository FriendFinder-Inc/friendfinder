'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', function(req, res, next){
    // TODO: is this the best way to do this?
    // https://groups.google.com/forum/#!topic/passportjs/6Pqc6oKDBnk
    req.session.rid = req.query.rid;
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
