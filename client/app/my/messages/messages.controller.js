'use strict';

angular.module('friendfinderApp')
  .controller('MessagesCtrl', function ($rootScope, $scope, User, Activity, Auth, Message, $window, Profile) {
    $('.messages-item')
    .tab({
      context : '#chat-heads',
    });

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

      if($scope.activeThreads.length){
        $('#active-tab').addClass('active');
        $('#active-segment').addClass('active');
        $('#inactive-tab').removeClass('active');
        $('#inactive-segment').removeClass('active');
      } else{
        $('#inactive-tab').addClass('active');
        $('#inactive-segment').addClass('active');
        $('#active-tab').removeClass('active');
        $('#active-segment').removeClass('active');
      }
    });

    $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
      if (toState.name === "my.messages") {
        if($scope.activeThreads.length){
          $('#active-tab').addClass('active');
          $('#active-segment').addClass('active');
          $('#inactive-tab').removeClass('active');
          $('#inactive-segment').removeClass('active');
        } else{
          $('#inactive-tab').addClass('active');
          $('#inactive-segment').addClass('active');
          $('#active-tab').removeClass('active');
          $('#active-segment').removeClass('active');
        }
      }
    });

    $scope.hasUnreadMessage = function(thread){
      angular.forEach(thread, function(message){
        if(message.timeRead === null && message.from != $scope.currentUser['@rid']){
          return true;
        }
      });
      return false;
    };

    $scope.updateTimeRead = function(thread){
      angular.forEach(thread, function(message){
        if(message.timeRead === null && message.from != $scope.currentUser['@rid']){
          message.timeRead = new Date();
          Message.update({rid: message['@rid'], params: {timeRead: new Date }})
          .$promise.then(function(res){
            $rootScope.$broadcast('messages-updated');
          });
        }
      });
    };

    $scope.showMessageModal = function(){
      $('.ui.modal.message.messages').modal('show');
    };

    $scope.hideModal = function(){
      $('.ui.modal.message.messages').modal('hide');
    };

    $scope.showThread = function(thread){
      $scope.selectedThread = thread;
      $scope.updateTimeRead(thread);
      $scope.selectedThreadOwner = (thread[0].to === $scope.currentUser['@rid'] ? thread[0].from :
                                                                    thread[0].to);
      setTimeout(function(){
        var div = document.getElementById("thread-scroll-box");
        div.scrollTop = div.scrollHeight;
      }, 1);
    };

    $('#send-message-btn-messages').click(function(e){
      $scope.sendMessage();
    });

    $scope.sendMessage = function(){
      var message = $('#message-area-messages').val();
      $('#send-message-btn-messages').addClass('loading');
      console.log('sending', message)

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
          $('#send-message-btn-messages').removeClass('loading');
          $scope.hideModal();
          $('#message-area-messages').val('');
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
