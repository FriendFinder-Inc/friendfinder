'use strict';

var express = require('express');
var controller = require('./activity.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.get('/autocomplete', auth.isAuthenticated(), controller.autoComplete);
router.get('/', auth.isAuthenticated(), controller.get);
router.post('/rid/request', auth.isAuthenticated(), controller.request);
router.get('/me', auth.isAuthenticated(), controller.getMine);
router.put('/me/update', auth.isAuthenticated(), controller.update);
router.post('/me/delete', auth.isAuthenticated(), controller.delete);
router.get('/me/find', auth.isAuthenticated(), controller.find);


module.exports = router;
