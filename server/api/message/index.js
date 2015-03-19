'use strict';

var express = require('express');
var controller = require('./message.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/me', auth.isAuthenticated(), controller.all);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/me/send', auth.isAuthenticated(), controller.send);

module.exports = router;
