'use strict';

angular.module('friendfinderApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, Message, $cookieStore, $q) {
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

      getUnreadMessages: function(cb){
        var unread = 0;
        Message.get().$promise.then(function(threads){
          angular.forEach(threads, function(thread){
            for(var i in thread){
              if(thread[i].timeRead === null && thread[i].from != currentUser['@rid']){
                unread++;
                break;
              }
            }
          });
          cb(unread);
        });
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
