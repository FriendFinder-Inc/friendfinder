'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', auth.isAuthenticated(), controller.get);
router.put('/me/update', auth.isAuthenticated(), controller.update);
router.delete('/me/delete', auth.isAuthenticated(), controller.delete);
router.post('/me/bookmark', auth.isAuthenticated(), controller.bookmark);
router.get('/me/bookmarks', auth.isAuthenticated(), controller.getBookmarks);
router.get('/:id/interests', auth.isAuthenticated(), controller.getInterests);
router.get('/:id/meetups', auth.isAuthenticated(), controller.getMeetups);
router.get('/me/mutualinterests', auth.isAuthenticated(), controller.mutualInterests);
router.get('/me/mutualfriends', auth.isAuthenticated(), controller.mutualFriends);
router.get('/me/mutualmeetups', auth.isAuthenticated(), controller.mutualMeetups);
router.get('/me/connectionpath', auth.isAuthenticated(), controller.connectionPath);
router.get('/me/find', auth.isAuthenticated(), controller.find);

module.exports = router;
