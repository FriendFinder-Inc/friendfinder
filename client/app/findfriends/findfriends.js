'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {
    
    $stateProvider
      .state('findfriends', {
        url: '/findfriends',
        templateUrl: 'app/findfriends/findfriends.html',
        controller: 'FindFriendsCtrl'
      });
  });
