'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my', {
        url: '/my',
        templateUrl: 'app/my/my.html',
        controller: 'MyCtrl'
      })
      .state('my.messages', {
        url: '/messages',
      })
      .state('my.bookmarks', {
        url: '/bookmarks',
      })
      .state('my.bookmarks.users', {
        url: '/users',
      })
      .state('my.bookmarks.acts', {
        url: '/activities',
      })
      .state('my.activities', {
        url: '/activities',
        // authenticate true TODO
      })
      .state('my.profile', {
        url: '/profile',
      });
  });
