'use strict';

angular.module('friendfinderApp')
  .controller('ApplicationCtrl', function ($rootScope, $scope, $http, $window, Auth, Profile, User, Activity, Bookmarks, Message) {

    // cache query results for efficiency
    $scope.users = [];
    $scope.activities = [];
    $scope.bookmarks = [];
    $scope.requests = [];
    $scope.myActivities = [];

    $scope.showSideDiv = true;

    $scope.currentUser = Auth.getCurrentUser();

    // retain mem for db pagination
    $scope.usersPageFilters = {};
    $scope.usersActivityFilters = {};

    Bookmarks.getBookmarkRids(function(rids){
      $scope.bookmarks = rids;
    });

    User.requests().$promise.then(function(requests){
      angular.forEach(requests, function(item){
        $scope.requests.push(item['@rid']);
      })
    });

    if($scope.currentUser.$promise){
      $scope.currentUser.$promise.then(function(user){
        Activity.get({rid: $scope.currentUser['@rid']}).$promise.then(function(activities){
          $scope.myActivities = activities;
        });
      });
    }

    $scope.linkModal_findfriends = function() {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      $('.ui.modal.message.others').modal('attach events', '.modal.profile .button.message-btn');
    };

    $scope.linkModal_findactivities = function() {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      $('.ui.modal.message.others').modal('attach events', '.modal.activity-profile .button.message-btn');
    };

    $scope.linkModal_messages = function() {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
    };

    $scope.linkModal_bookmarks = function(type) {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      if(type === 'users'){
        $('.ui.modal.message.others').modal('attach events', '.modal.bookmarks-users-profile .button.message-btn');
      } else{
        $('.ui.modal.message.others').modal('attach events', '.modal.bookmarks-acts-profile .button.message-btn');
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

    $scope.bookmark = function(rid){
      Bookmarks.add(rid, function(bookmarks){
        Bookmarks.getBookmarkRids(function(rids){
          $scope.bookmarks = rids;
        });
      });
    };

    $scope.joinRequest = function(activity){
      var data = {
        rid: activity['@rid'],
        owner: activity.creator,
        activityTitle: activity.title
      };
      Activity.request(data).$promise.then(function(bookmarks){
        $scope.requests.push(data.rid);
      });
    };

    $scope.isRequested = function(rid){
      return ($scope.requests.indexOf(rid) != -1);
    };

    $scope.isBookmarked = function(rid){
      return ($scope.bookmarks.indexOf(rid) != -1);
    };

    $scope.addActivity = function(item){
      $scope.myActivities.push(item);
    };

    $scope.closeModals = function(){
      $('.ui.modal').modal('hide');
    };

    $scope.closeMessageModal = function(){
      $('#message-modal').modal('hide');
    };

    $('#send-message-btn').click(function(e){
      $scope.sendMessage();
    });

    $scope.sendMessage = function(){
      var message = $('#message-area').val();
      $('#send-message-btn').addClass('loading');
      console.log('sending message')

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
        $('#send-message-btn').removeClass('loading');
        $scope.closeMessageModal();
      });
    };

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
