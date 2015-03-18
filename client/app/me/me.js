'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('me', {
        url: '/me',
        templateUrl: 'app/me/me.html',
        controller: 'MeCtrl'
      })
      .state('me.profile', {
        url: '/profile',
        templateUrl: 'app/me/profile/profile.html',
        controller: 'ProfileCtrl'
      })
      .state('me.messages', {
        url: '/messages',
        templateUrl: 'app/me/messages/messages.html',
        controller: 'MessagesCtrl'
      })
      .state('me.bookmarks', {
        url: '/bookmarks',
        templateUrl: 'app/me/bookmarks/bookmarks.html',
        controller: 'BookmarksCtrl'
      })
      .state('me.bookmarks.users', {
        url: '/users',
        templateUrl: 'app/me/bookmarks/bookmarksUsers.html',
        controller: 'BookmarksCtrl'
      })
      .state('me.bookmarks.activities', {
        url: '/activities',
        templateUrl: 'app/me/bookmarks/bookmarksActivities.html',
        controller: 'BookmarksCtrl'
      })
      .state('me.activities', {
        url: '/activities',
        templateUrl: 'app/me/activities/activities.html',
        controller: 'ActivitiesCtrl'
        // authenticate true TODO
      });
  });
