'use strict';

angular.module('friendfinderApp')
  .controller('AccountCtrl', function ($scope, User, Auth, $window, $cookieStore) {

    $scope.currentUser = Auth.getCurrentUser();

    $scope.meetupAuth = function(){
      var url = '/auth/meetup?access_token='+$cookieStore.get('token');
      $window.location.href = url;
    };

    $scope.facebookSync = function(){

    };

  });
