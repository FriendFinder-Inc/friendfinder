'use strict';

angular.module('friendfinderApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $(document).ready(function(){
    	$('.right.menu.open').on("click",function(e){
            e.preventDefault();
    		$('.ui.vertical.menu').toggle();
    	});

    	$('.ui.dropdown').dropdown();
    });

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
