'use strict';

angular.module('friendfinderApp')
  .controller('ApplicationCtrl', function ($scope, $http, $window, Auth) {

    // $scope.findUsers = [];
    // $scope.findActivities = [];
    // $scope.selectedUser = {};
    // $scope.selectedUserRid = null;

    Auth.getCurrentUser();

    if(window.innerWidth < 768){
      $window.isMobile = true;
    } else {
      $window.isMobile = false;
    }

    $(window).resize(function(){
      $scope.$apply(function(){
        if(window.innerWidth < 768){
          $window.isMobile = true;
        } else {
          $window.isMobile = false;
        }
      });
    });

  });
