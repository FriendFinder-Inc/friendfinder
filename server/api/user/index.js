'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/me/update', auth.isAuthenticated(), controller.update);
router.post('/me/bookmark', auth.isAuthenticated(), controller.bookmark);
router.get('/me/bookmarks', auth.isAuthenticated(), controller.getBookmarks);
router.get('/me/find', auth.isAuthenticated(), controller.find);
router.get('/me/mutualinterests', auth.isAuthenticated(), controller.mutualInterests);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
