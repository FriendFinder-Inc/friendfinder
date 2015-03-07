'use strict';

var express = require('express');
var controller = require('./message.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/me', auth.isAuthenticated(), controller.sent);
router.get('/me/sent', auth.isAuthenticated(), controller.sent);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/me/send', auth.isAuthenticated(), controller.send);
router.get('/me/received', auth.isAuthenticated(), controller.received);

module.exports = router;
