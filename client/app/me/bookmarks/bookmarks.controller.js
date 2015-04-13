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

    $scope.linkModal = function(type) {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      if(type === 'users'){
        $('.ui.modal.message').modal('attach events', '.modal.bookmarks-users-profile .button.message-btn');
      } else{
        $('.ui.modal.message').modal('attach events', '.modal.bookmarks-acts-profile .button.message-btn');
      }
    };

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

    $scope.closeModals = function(){
      $('.ui.modal').modal('hide');
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

    $scope.showProfileModal = function(rid, type){
      $scope.newUser = true;
      $scope.showAllInterests = false;
      $scope.showMutualFriends = true;
      $scope.showMutualInterests = true;

      Profile.getUser(rid, function(user){
        $scope.selectedUser = user;
        if(type === 'users'){
          $('.ui.modal.bookmarks-users-profile').modal('setting', {
            onVisible: function(){
              // make sure all data is visible
              $('.activity-title').textfill({});
              $('.activity-date').textfill({});
              $('.activity-location').textfill({});
            }
          }).modal('show');
        } else {
          $('.ui.modal.bookmarks-acts-profile').modal('setting', {
            onVisible: function(){
              // make sure all data is visible
              $('.activity-title').textfill({});
              $('.activity-date').textfill({});
              $('.activity-location').textfill({});
            }
          }).modal('show');
        }
        Profile.getProfilePhotos(function(imgUrls){
          $scope.fbPicsUrls = imgUrls;
        });
        Profile.getMutualInterests(function(mutualInterests){
          $scope.mutualInterests = mutualInterests;
          $scope.$apply(function(){});
        });
        Profile.getMutualFriendsOrPath(function(type, res){
          if(type === 'friends'){
            $scope.mutualFriends = res;
          } else{
            $scope.showMutualFriends = false;
            $scope.connectionPath = res;
          }
          setTimeout(function(){
            $scope.$apply(function(){});
          }, 1);
        });
        Profile.getMutualMeetups(function(mutual){
          $scope.mutualMeetups = mutual;
          setTimeout(function(){
            $scope.$apply(function(){});
          }, 1);
        });
        Profile.getUsersActivities(function(activities){
          $scope.usersActivities = activities;
          setTimeout(function(){
            $scope.$apply(function(){});
          }, 1);
        });
      });
    };

    $scope.showMutualInterests = true;
    $scope.toggleMutualInterests = function(){
      $scope.showMutualInterests = !$scope.showMutualInterests;
    };

    $scope.showMutualFriends = true;
    $scope.toggleMutualFriends = function(){
      $scope.showMutualFriends = !$scope.showMutualFriends;
    };

    $scope.showConnectionPath = true;
    $scope.toggleConnectionPath = function(){
      $scope.showConnectionPath = !$scope.showConnectionPath;
    };

    $scope.newUser = true;
    $scope.toggleAllInterests = function(){
      if(!$scope.showAllInterests && $scope.newUser){
        $scope.allInterests = {};
        $scope.allInterests.tags = [];
        $scope.allInterests.meetups = [];
        Profile.getUsersInterests(function(interests){
          $scope.allInterests.tags = interests.tags;
        });
        Profile.getUsersMeetups(function(meetups){
          $scope.allInterests.meetups = meetups;
        });
        $scope.newUser = false;
      }
      $scope.showAllInterests = !$scope.showAllInterests;
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

    $scope.sendMessage = function(){
      var messageA = $('#message-area-bookmarksusers').val();
      var messageB = $('#message-area-bookmarksacts').val();
      var message = messageA || messageB;
      var data =  {
                    to: $scope.selectedUser['@rid'],
                    toEmail: $scope.selectedUser.email,
                    toName: $scope.selectedUser.name.split(' ')[0],
                    from: $scope.currentUser['@rid'],
                    fromEmail: $scope.currentUser.email,
                    fromName: $scope.currentUser.name.split(' ')[0],
                    timeSent: new Date(),
                    timeRead: null,
                    content: message,
                    toFacebookId: $scope.selectedUser.facebookId,
                    fromFacebookId: $scope.currentUser.facebookId
                  };

      Message.send(data).$promise.then(function(res){
        $('#message-area-bookmarksusers').val('');
        $('#message-area-bookmarksacts').val('');
      });
    };


  });
