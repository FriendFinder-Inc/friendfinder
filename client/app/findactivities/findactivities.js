'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('findactivities', {
        url: '/find/activities',
        templateUrl: 'app/findactivities/findactivities.html',
        controller: 'FindActivitiesCtrl'
      });
  });
