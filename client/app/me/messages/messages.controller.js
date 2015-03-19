'use strict';

angular.module('friendfinderApp')
  .controller('MessagesCtrl', function ($scope, User, Auth, Message) {
    $('.menu .item')
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
      })
    });

    $scope.showThread = function(thread){
      console.log('st', thread);
      $scope.selectedThread = thread;
    }
  });
