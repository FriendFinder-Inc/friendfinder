'use strict';

angular.module('friendfinderApp')
  .controller('NavbarCtrl', function ($scope, $window, $location, Auth) {

    $scope.user = Auth.getCurrentUser();
    // $('.ui.accordion').accordion();

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

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    $scope.isMobile = function(){
      return $window.isMobile;
    };

    $scope.showDropdown = false;


  });
