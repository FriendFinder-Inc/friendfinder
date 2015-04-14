'use strict';

angular.module('friendfinderApp')
  .controller('BookmarksCtrl', function ($scope, User, Auth, Activity, Bookmarks, Profile) {

    $scope.currentUser = Auth.getCurrentUser();

    $scope.bookmarks = [];
    $scope.users = [];
    $scope.activities = [];
    Bookmarks.getBookmarkRids(function(rids){
      $scope.bookmarks = rids;
    });
    Bookmarks.getUserBookmarks(function(users){
      $scope.users = users;
    });
    Bookmarks.getActivityBookmarks(function(activities){
      $scope.activities = activities;
    });
    $scope.requests = [];


    User.requests().$promise.then(function(requests){
      angular.forEach(requests, function(item){
        $scope.requests.push(item['@rid']);
      });
    });

    $scope.isBookmarked = function(rid){
      return !!$scope.bookmarks.indexOf(rid);
    };

    $scope.removeBookmark = function(rid){
      Bookmarks.remove(rid, function(bookmarks){
        Bookmarks.getBookmarkRids(function(rids){
          $scope.bookmarks = rids;
        });
        Bookmarks.getUserBookmarks(function(users){
          $scope.users = users;
        });
        Bookmarks.getActivityBookmarks(function(activities){
          $scope.activities = activities;
        });
      });
    };

    $scope.alreadyRequested = function(item){
      if(item && $scope.requests.indexOf(item['@rid']) != -1){
        return true;
      } else{
        return false;
      }
    };

    $scope.request = function(item){
      var data = {
        rid: item['@rid'],
        owner: item.creator,
        activityTitle: item.title
      };
      Activity.request(data).$promise.then(function(bookmarks){
        $scope.requests.push(data.rid);
      });
    };

    $scope.makeHalf = function(){
      return $(window).width() > 992 ||
              ($(window).width() > 800 &&
                $(window).width() < 992);
    };

    $scope.makeHalfUser = function(){
      return $(window).width() > 992 ||
              ($(window).width() > 768 &&
                $(window).width() < 992);
    };

    $scope.birthdayToAge = function(birthday){
      // moment.js is one of the best js libs ever!
      return moment().diff(birthday, 'years');
    };

    $scope.isTriple = function(i){
      return (i === 0) || (i % 3 === 0);
    };
    $scope.isDouble = function(i){
      return (i === 0) || (i % 2 === 0);
    };
    $scope.isTooSmall = function(){
      return window.innerWidth < 1150;
    };

  });
