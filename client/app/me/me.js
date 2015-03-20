'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('me', {
        url: '/me',
        templateUrl: 'app/me/me.html',
        controller: 'MeCtrl'
      })
      .state('me.messages', {
        url: '/messages',
      })
      .state('me.bookmarks', {
        url: '/bookmarks',
      })
      .state('me.bookmarks.users', {
        url: '/users',
      })
      .state('me.bookmarks.acts', {
        url: '/activities',
      })
      .state('me.activities', {
        url: '/activities',
        // authenticate true TODO
      })
      .state('me.profile', {
        url: '/profile',
      });
  });
