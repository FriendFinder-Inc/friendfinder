'use strict';

angular.module('friendfinderApp')
  .controller('MainCtrl', function ($scope, $http, $window) {
    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/facebook';
    };
  });
