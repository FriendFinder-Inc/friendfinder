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

      $scope.sortByUnread($scope.activeThreads);
      $scope.sortByUnread($scope.inactiveThreads);

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

    // move unread threads to top
    $scope.sortByUnread = function(threads){
      var swap = function(i, j){
        var temp = threads[i];
        threads[i] = threads[j];
        threads[j] = temp;
      };
      var indexes = {};
      angular.forEach(threads, function(thread, index){
        if($scope.hasUnreadMessage(thread)){
          var swapped = false;
          var i = 0;
          while(!swapped){
            if(indexes[i] === true){
              i++;
            } else {
              swap(i, index);
              indexes[i] = true;
              swapped = true;
            }
          }
        }
      });
    };

    $scope.hasUnreadMessage = function(thread){
      var res = false;
      angular.forEach(thread, function(message){
        if(message.timeRead === null && message.from != $scope.currentUser['@rid']){
          res = true;
        }
      });
      return res;
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

      // extract info from first message in thread
      var firstMessage = $scope.selectedThread[0];
      console.log('st', $scope.selectedThread, firstMessage)
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
