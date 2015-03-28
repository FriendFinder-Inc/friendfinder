'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('findfriends', {
        url: '/find/friends',
        templateUrl: 'app/findfriends/findfriends.html',
        controller: 'FindFriendsCtrl'
      });
  });
