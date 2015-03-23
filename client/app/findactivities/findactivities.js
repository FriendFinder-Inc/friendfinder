'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('findactivities', {
        url: '/findactivities',
        templateUrl: 'app/findactivities/findactivities.html',
        controller: 'FindActivitiesCtrl'
      });
  });
