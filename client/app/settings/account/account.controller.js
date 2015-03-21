'use strict';

angular.module('friendfinderApp')
  .controller('AccountCtrl', function ($scope, User, Auth, $window) {

    $scope.meetupAuth = function(){
      User.get().$promise.then(function(user){
        // have to encode the rid due to special chars
        var rid = user['@rid'].split('#')[1].split(':')[0]+'_'+
                  user['@rid'].split('#')[1].split(':')[1];
        var url = '/auth/meetup?rid='+rid
        $window.location.href = url;
      })
    };

  });
