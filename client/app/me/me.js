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
        // authenticate true TODO
      });
  });
