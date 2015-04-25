'use strict';

angular.module('friendfinderApp')
  .controller('NavbarCtrl', function ($scope, $window, $location, Auth, $state) {

    $scope.user = Auth.getCurrentUser();
    $('.ui.dropdown').dropdown();

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
      $window.location.reload();
    };

    $scope.unreadMessages = 0;
    Auth.isLoggedInAsync(function(loggedIn){
      if(loggedIn){
        Auth.getUnreadMessages(function(num){
          $scope.unreadMessages = num;
        });
      }
    });

    $scope.$on('messages-updated', function(event, args){
      Auth.getUnreadMessages(function(num){
        $scope.unreadMessages = num;
      });
    });

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
      return $scope.unreadMessages;
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
