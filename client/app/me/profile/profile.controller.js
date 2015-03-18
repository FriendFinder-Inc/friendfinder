'use strict';

angular.module('friendfinderApp')
  .controller('ProfileCtrl', function ($scope, User, Auth) {
    $('.ui.dropdown').dropdown();
    $scope.currentUser = {};

    Auth.getCurrentUser().$promise.then(function(user){
      $scope.currentUser = user;
      $scope.getFacebookPhotos(user);
    });

    $scope.getFacebookPhotos = function(user){
      $scope.fbPicsUrls = [];
      for(var i = 0; i < 8; i++){
        var img = $.cloudinary.image(user.facebookId+'/'+i+'.jpg');
        $scope.fbPicsUrls.push(img[0].src);
      }
    };



  });
