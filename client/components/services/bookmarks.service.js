'use strict';

angular.module('friendfinderApp')
  .factory('Bookmarks', function Auth($rootScope, User, $cookieStore) {
    var currentBookmarks = [];
    if($cookieStore.get('token')) {
      currentBookmarks = User.bookmarks();
    }

    return {

      getCurrentBookmarks: function(cb) {
        currentBookmarks.$promise.then(function(bookmarks){
          cb(bookmarks);
        });
      },

      getBookmarkRids: function(cb){
        var rids = [];
        currentBookmarks.$promise.then(function(bookmarks){
          angular.forEach(bookmarks, function(item){
            rids.push(item['@rid']);
          });
          cb(rids);
        });
      },

      getUserBookmarks: function(cb){
        var users = [];
        currentBookmarks.$promise.then(function(bookmarks){
          angular.forEach(bookmarks, function(item){
            if(item['@class'] === 'RegisteredUser'){
              users.push(item);
            }
          });
          cb(users);
        });
      },

      getActivityBookmarks: function(cb){
        var activities = [];
        currentBookmarks.$promise.then(function(bookmarks){
          angular.forEach(bookmarks, function(item){
            if(item['@class'] === 'Activity'){
              activities.push(item);
            }
          });
          cb(activities);
        });
      },

      add: function(rid, cb){
        User.bookmark({rid: rid}).$promise.then(function(res){
          currentBookmarks = User.bookmarks();
          currentBookmarks.$promise.then(function(bookmarks){
            cb(bookmarks);
          });
        });
      },

      remove: function(rid, cb){
        User.removeBookmark({rid: rid}).$promise.then(function(res){
          currentBookmarks = User.bookmarks();
          currentBookmarks.$promise.then(function(bookmarks){
            cb(bookmarks);
          });
        });
      },

      isBookmarked: function(rid, cb){
        currentBookmarks.$promise.then(function(bookmarks){
          angular.forEach(bookmarks, function(item){
            if(item['@rid'] === rid){
              cb(true);
            }
          });
          cb(false);
        });
      }

    };
  });
