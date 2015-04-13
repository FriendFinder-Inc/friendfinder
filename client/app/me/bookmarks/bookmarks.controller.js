'use strict';

angular.module('friendfinderApp')
  .controller('BookmarksCtrl', function ($scope, User, Auth, Activity, Bookmarks) {

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
      User.getById({rid: rid}).$promise.then(function(user){
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
        $scope.getFacebookPhotos(user);
        $scope.getMutualInterests(user);
        $scope.getMutualFriends(user);
        $scope.getMutualMeetups(user);
        $scope.getUsersActivities(user);
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

    $scope.getMutualInterests = function(user){
      $scope.mutualInterests = {};
      $scope.mutualInterests.pages = [];
      $scope.mutualInterests.tags = [];
      $scope.mutualInterests.meetups = [];
      User.mutualinterests({rid: user['@rid']}).$promise.then(function(mutual){
        var token = {
          access_token: $scope.currentUser.fbAccessToken
        };
        angular.forEach(mutual, function(like){
          if(like['@class'] === 'Page'){
            FB.api('/'+like.id, token,function(res){
              FB.api('/'+like.id+'/picture', token,function(img){
                $scope.mutualInterests.pages.push({
                  name: res.name,
                  link: res.link,
                  img: img.data.url
                });
                $scope.$apply(function(){}); // update for modal
              });
            });
          } else {
            $scope.mutualInterests.tags.push({name: like.name});
          }
        });
      });
    };

    $scope.getMutualFriends = function(user){
      $scope.mutualFriends = [];
      User.mutualfriends({rid: user['@rid']}).$promise.then(function(mutual){
        $scope.mutualFriends = mutual;
        if(!mutual.length){
          $scope.getConnectionPath(user);
        }
      });
    };

    $scope.getMutualMeetups = function(user){
      $scope.mutualMeetups = [];
      User.mutualmeetups({rid: user['@rid']}).$promise.then(function(mutual){
        $scope.mutualMeetups = mutual;
      });
    };

    $scope.getUsersInterests = function(user){
      User.interests({rid: user['@rid']}).$promise.then(function(likes){
        angular.forEach(likes, function(like){
          if(like['@class'] === 'Tag'){
            $scope.allInterests.tags.push(like);
          } else {
            //TODO: show fb likes?
          }
        });
      });
    };

    $scope.getUsersMeetups = function(user){
      User.meetups({rid: user['@rid']}).$promise.then(function(meetups){
        $scope.allInterests.meetups = meetups;
      });
    };

    $scope.getUsersActivities = function(user){
      $scope.usersActivities = [];
      Activity.get({rid: user['@rid']}).$promise.then(function(activities){
        $scope.usersActivities = activities;
      });
    };

    $scope.getConnectionPath = function(user){
      $scope.connectionPath = [];
      User.getConnectionPath({rid: user['@rid']}).$promise.then(function(path){
        $scope.connectionPath = path;
      });
    };

    $scope.getFacebookPhotos = function(user){
      $scope.fbPicsUrls = [];
      for(var i = 0; i < 8; i++){
        var img = $.cloudinary.image(user.facebookId+'/'+i+'.jpg');
        $scope.fbPicsUrls.push(img[0].src);
      }
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
