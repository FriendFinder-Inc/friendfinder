'use strict';

angular.module('friendfinderApp')
  .controller('MessagesCtrl', function ($scope, User, Activity, Auth, Message, $window, Profile) {
    $('.messages-item')
    .tab({
      context : '#chat-heads',
    });

    $scope.linkModal = function() {
      $('.ui.modal.messages-profile').modal({allowMultiple: false});
      $('.ui.modal.messages-profile').modal('setting', 'transition', 'fade');
    };

    $scope.currentUser = Auth.getCurrentUser();

    $scope.activeThreads = [];
    $scope.inactiveThreads = [];
    $scope.selectedThread = [];

    Message.get().$promise.then(function(threads){
      angular.forEach(threads, function(thread){
        thread = thread.toJSON();

        // separate threads into active and inactive
        var active = false;
        var to = thread[0].to;
        angular.forEach(thread, function(message){
          if(message.to != to){
            active = true;
          }
        })
        if(!active){
          $scope.inactiveThreads.push(thread);
        } else {
          $scope.activeThreads.push(thread);
        }
      });
    });

    $scope.showMessageModal = function(){
      $('.ui.small.modal.message.reply').modal('show');
    };

    $scope.hideModal = function(){
      $('.ui.modal').modal('hide');
    };

    $scope.showThread = function(thread){
      $scope.selectedThread = thread;
      $scope.selectedThreadOwner = (thread[0].to === $scope.currentUser['@rid'] ? thread[0].from :
                                                                    thread[0].to);
      setTimeout(function(){
        var div = document.getElementById("thread-scroll-box");
        div.scrollTop = div.scrollHeight;
      }, 1);
    };

    $scope.showProfileModal = function(rid){
      $scope.newUser = true;
      $scope.showAllInterests = false;
      $scope.showMutualFriends = true;
      $scope.showMutualInterests = true;
      Profile.getUser(rid, function(user){
        $scope.selectedUser = user;
        $('.ui.modal.messages-profile').modal('setting', {
          onVisible: function(){
            // make sure all data is visible
            $('.activity-title').textfill({});
            $('.activity-date').textfill({});
            $('.activity-location').textfill({});
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

    $scope.prettyDate = function(dateStr){
      return moment(dateStr).format('ll');
    };

    $scope.sendMessage = function(){
      var message = $('#message-area-messages').val();

      // extract info from first message in thread
      var firstMessage = $scope.selectedThread[0];
      var toRid = (firstMessage.to === $scope.currentUser['@rid'] ? firstMessage.from :
                                                                    firstMessage.to);
      var toEmail = (firstMessage.toEmail === $scope.currentUser.email ? firstMessage.fromEmail :
                                                                         firstMessage.toEmail);
      var toFbId = (firstMessage.toFacebookId === $scope.currentUser.facebookId ? firstMessage.fromFacebookId :
                                                                                  firstMessage.toFacebookId);
      var toName = (firstMessage.toName === $scope.currentUser.name.split(' ')[0] ? firstMessage.fromName :
                                                                                  firstMessage.toName);

      var data =  {
                    to: toRid,
                    toEmail: toEmail,
                    toName: toName,
                    from: $scope.currentUser['@rid'],
                    fromEmail: $scope.currentUser.email,
                    fromName: $scope.currentUser.name.split(' ')[0],
                    timeSent: null, //set on server
                    timeRead: null,
                    content: message,
                    toFacebookId: toFbId,
                    fromFacebookId: $scope.currentUser.facebookId
                  };

      Message.send(data).$promise.then(function(res){
        $('#message-area-messages').val('');
        Message.get().$promise.then(function(threads){
          $scope.activeThreads = [];
          $scope.inactiveThreads = [];
          angular.forEach(threads, function(thread){
            thread = thread.toJSON();

            // separate threads into active and inactive
            var active = false;
            var to = thread[0].to;
            angular.forEach(thread, function(message){
              if(message.to != to){
                active = true;
              }
            })
            if(!active){
              $scope.inactiveThreads.push(thread);
            } else {
              $scope.activeThreads.push(thread);
            }
          });
          setTimeout(function(){
            $scope.$apply(function(){});
          }, 1);
          //reset selectedThread
          angular.forEach(threads, function(thread){
            var rid = (thread[0].to === $scope.currentUser['@rid'] ? thread[0].from :
                                                                      thread[0].to);
            if(rid === $scope.selectedThreadOwner){
              $scope.showThread(thread);
            }
          });
          $scope.hideModal();
        });
      });
    };

    $scope.validateResponseInput = function(){
      return true;
    };

    $scope.isMobile = function(){
      return $window.isMobile;
    };

    $scope.myMessage = function(fbId){
      return fbId === $scope.currentUser.facebookId;
    };

    $scope.threadIsSelected = function(){
      return Object.keys($scope.selectedThread).length;
    };

    $scope.toggleChatHeads = function(){
      $scope.selectedThread = [];
    };

    $scope.showChatHeads = function(){
      if($scope.isMobile()){
        if($scope.threadIsSelected()){
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    };

  });
