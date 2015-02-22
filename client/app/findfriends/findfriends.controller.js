'use strict';

angular.module('friendfinderApp')
  .controller('FindFriendsCtrl', function ($scope, $http, Auth, User) {
    $scope.find = function(){
      // split into two arrays for easy two column layout
      // TODO: on mobile the columns should interleave to
      // preserve order
      $scope.evenUsers = [];
      $scope.oddUsers = [];
      User.find({'test':'filter'}, function(users){
        angular.forEach(users, function(user, index){
          index%2 ? $scope.evenUsers.push(user) : $scope.oddUsers.push(user);
        });
      });
    }
    $scope.find();
  });
