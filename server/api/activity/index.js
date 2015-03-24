'use strict';

var express = require('express');
var controller = require('./activity.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.get('/autocomplete', auth.isAuthenticated(), controller.autoComplete);
router.get('/me', auth.isAuthenticated(), controller.getAll);
router.put('/me/update', auth.isAuthenticated(), controller.update);
router.post('/me/delete', auth.isAuthenticated(), controller.delete);

module.exports = router;
