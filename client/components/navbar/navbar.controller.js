'use strict';

angular.module('friendfinderApp')
  .controller('NavbarCtrl', function ($scope, $window, $location, Auth, $state) {

    $scope.user = Auth.getCurrentUser();
    $('.ui.dropdown').dropdown();

    $('#menu-icon').mouseenter(function(e){
      $scope.toggleMenu();
    });
    $('#dropdown-menu-list').mouseleave(function(e){
      $scope.toggleMenu();
    });

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
      $window.location.reload();
    };

    $scope.isMobile = function(){
      return $window.isMobile;
    };

    $scope.onFriends = function(){
      return $window.location.pathname === '/find/friends';
    };

    $scope.onActivities = function(){
      return $window.location.pathname === '/find/activities';
    };

    $scope.unreadMail = function(){
      return true;
    };

    $scope.nav = function(url){
      $window.location.href = url;
    };

    $scope.toggleMenu = function(){
      $('.ui.dropdown.toplevel ').dropdown('toggle');
    };

    $scope.toggleSidebar = function(){
      $('.ui.right.sidebar').sidebar('toggle');
    };

    $scope.isActive = function(url){
      if($window.location.pathname === url){
        return true;
      }
      return false;
    };

    $scope.showHidden = false;

  });
