'use strict';

angular.module('friendfinderApp')
  .controller('BookmarksCtrl', function ($scope, User, Auth, Activity, Bookmarks, Profile) {

    setTimeout(function(){
      $('.activity-title').textfill({});
      $('.activity-location').textfill({});
      $('.popup.icon').popup({on: 'click'});
      $('.popup.icon').click(function(e){
        e.stopPropagation();
      });
    }, 1);

    $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === "my.bookmarks.acts") {
        setTimeout(function(){
          $('.activity-title').textfill({});
          $('.activity-location').textfill({maxFontPixels: 12});
        }, 1);
      }
      if (toState.name === "my.bookmarks.users") {
        setTimeout(function(){
          $('.intro-wrapper').flowtype({
           minimum   : 250,
           maximum   : 800,
           minFont   : 10,
           maxFont   : 72,
           fontRatio : 25
          });
          $('.middle').flowtype({
           minimum   : 80,
           maximum   : 700,
           minFont   : 12,
           maxFont   : 150,
           fontRatio : 12
          });
        }, 1);
      }
    });

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
      if(item && $scope.$parent.$parent.requests.indexOf(item['@rid']) != -1){
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
      Activity.request(data).$promise.then(function(res){
        $scope.$parent.$parent.requests.push(data.rid);
        setTimeout(function(){
          $scope.$apply(function(){});
        }, 1);
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
