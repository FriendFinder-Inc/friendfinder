'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/', auth.isAuthenticated(), controller.get);
router.put('/me/update', auth.isAuthenticated(), controller.update);
router.delete('/me', auth.isAuthenticated(), controller.delete);
router.post('/me/bookmark', auth.isAuthenticated(), controller.bookmark);
router.delete('/me/meetups', auth.isAuthenticated(), controller.removeMeetups);
router.delete('/me/bookmark', auth.isAuthenticated(), controller.removeBookmark);
router.get('/me/bookmarks', auth.isAuthenticated(), controller.getBookmarks);
router.get('/me/requests', auth.isAuthenticated(), controller.getRequests);
router.get('/:id/interests', auth.isAuthenticated(), controller.getInterests);
router.get('/:id/meetups', auth.isAuthenticated(), controller.getMeetups);
router.get('/me/mutualinterests', auth.isAuthenticated(), controller.mutualInterests);
router.get('/me/mutualfriends', auth.isAuthenticated(), controller.mutualFriends);
router.get('/me/mutualmeetups', auth.isAuthenticated(), controller.mutualMeetups);
router.get('/me/connectionpath', auth.isAuthenticated(), controller.connectionPath);
router.get('/me/find', auth.isAuthenticated(), controller.find);

module.exports = router;
