'use strict';

angular.module('friendfinderApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {

    $scope.user = Auth.getCurrentUser();
    $('.ui.accordion').accordion();

    if(window.innerWidth < 768){
      $scope.isMobile = true;
    } else {
      $scope.isMobile = false;
    }

    // is this better than using media queries in css?
    $(window).resize(function(){
      $scope.$apply(function(){
        if(window.innerWidth < 768){
          $scope.isMobile = true;
        } else {
          $scope.isMobile = false;
        }
      });
    });

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };


  });
