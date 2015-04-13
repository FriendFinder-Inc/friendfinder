'use strict';

angular.module('friendfinderApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get();
    }

    return {

      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },

      getCurrentUser: function() {
        return currentUser;
      },

      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      getToken: function() {
        return $cookieStore.get('token');
      }
    };
  });
