'use strict';

angular.module('friendfinderApp')
  .controller('ApplicationCtrl', function ($scope, $http, $window, Auth, Profile, User, Activity, Bookmarks, Message) {

    // cache query results for efficiency
    $scope.findUsers = [];
    $scope.findActivities = [];
    $scope.bookmarks = [];

    $scope.currentUser = Auth.getCurrentUser();

    Bookmarks.getBookmarkRids(function(rids){
      $scope.bookmarks = rids;
    });

    $scope.linkModal_findfriends = function() {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      $('.ui.modal.message').modal('attach events', '.modal.profile .button.message-btn');
    };

    $scope.linkModal_findactivities = function() {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      $('.ui.modal.message').modal('attach events', '.modal.activity-profile .button.message-btn');
    };

    $scope.linkModal_bookmarks = function(type) {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      if(type === 'users'){
        $('.ui.modal.message').modal('attach events', '.modal.bookmarks-users-profile .button.message-btn');
      } else{
        $('.ui.modal.message').modal('attach events', '.modal.bookmarks-acts-profile .button.message-btn');
      }
    };

    $scope.showProfileModal = function(rid, modalName){
      $scope.newUser = true;
      $scope.showAllInterests = false;
      $scope.showMutualFriends = true;
      $scope.showMutualInterests = true;

      Profile.getUser(rid, function(user){
        $scope.selectedUser = user;
        $('.ui.modal.'+modalName).modal('setting', {
          onVisible: function(){
            // make sure all data is visible
            $('.activity-title').textfill({});
            $('.activity-date').textfill({});
            $('.activity-location').textfill({});
            $scope.$apply(function(){});
          }
        }).modal('show');
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


    $scope.bookmarkUser = function(user){
      Bookmarks.add(user['@rid'], function(bookmarks){
        Bookmarks.getBookmarkRids(function(rids){
          $scope.bookmarks = rids;
        });
      });
    };

    $scope.isBookmarked = function(rid){
      return ($scope.bookmarks.indexOf(rid) != -1);
    };

    $scope.closeModals = function(){
      $('.ui.modal').modal('hide');
    };

    $scope.sendMessage = function(){
      var message = $('#message-area').val();

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
        $('#message-area').val('');
      });
    };

    $('#send-message-btn').click(function(){
      $scope.sendMessage();
      $scope.closeModals();
    });

    $('#cancel-message-btn').click(function(){
      $scope.closeModals();
    });

    $scope.prettyDate = function(dateStr){
      return moment(dateStr).format('ll');
    };

    // for responsive css
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

  });
