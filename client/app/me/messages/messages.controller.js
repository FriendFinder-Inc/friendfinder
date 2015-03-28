'use strict';

angular.module('friendfinderApp')
  .controller('MessagesCtrl', function ($scope, User, Auth, Message) {
    $('.messages-item')
      .tab({
        context : '#chat-heads',
        // history: true
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
            //TODO for loop optimize
          }
        })
        if(!active){
          $scope.inactiveThreads.push(thread);
        } else {
          $scope.activeThreads.push(thread);
        }
      })
    });

    $scope.showThread = function(thread){
      $scope.selectedThread = thread;
    };

    $scope.sendMessage = function(){
      var message = $('#response-text-area').val();

      // extract info from first message in thread
      var firstMessage = $scope.selectedThread[0];
      var toRid = (firstMessage.to === $scope.currentUser['@rid'] ? firstMessage.from :
                                                                    firstMessage.to);
      var toEmail = (firstMessage.toEmail === $scope.currentUser.email ? firstMessage.fromEmail :
                                                                         firstMessage.toEmail);
      var toFbId = (firstMessage.toFacebookId === $scope.currentUser.facebookId ? firstMessage.fromFacebookId :
                                                                                  firstMessage.toFacebookId);

      var data =  {
                    to: toRid,
                    toEmail: toEmail,
                    from: $scope.currentUser['@rid'],
                    fromEmail: $scope.currentUser.email,
                    timeSent: new Date(),
                    timeRead: null,
                    content: message,
                    toFacebookId: toFbId,
                    fromFacebookId: $scope.currentUser.facebookId
                  };

      Message.send(data).$promise.then(function(res){
        Message.get({userId: $scope.currentUser.facebookId}).$promise.then(function(messages){
          console.log('got messages', messages);
        });
      });
    };

    $scope.myMessage = function(fbId){
      return fbId === $scope.currentUser.facebookId;
    };

    $scope.threadIsSelected = function(){
      return Object.keys($scope.selectedThread).length;
    };

  });
