'use strict';

angular.module('friendfinderApp')
  .controller('ProfileCtrl', function ($scope, User, Auth) {
    $('.ui.dropdown').dropdown();
    $scope.currentUser = {};
    $scope.modified = false;


    Auth.getCurrentUser().$promise.then(function(user){
      $scope.currentUser = user;
      $scope.getFacebookPhotos(user);

      $scope.firstCall = true;

      $scope.$watchGroup(['currentUser.profile.intro',
                          'currentUser.profile.idealWeekend',
                          'currentUser.profile.dreamDestination',
                          'currentUser.profile.details'],
                            function(newValues, oldValues) {

        if(!$scope.firstCall){
          $scope.modified = true;
        }
        $scope.firstCall = false;
      });
    });

    $scope.getFacebookPhotos = function(user){
      $scope.fbPicsUrls = [];
      for(var i = 0; i < 8; i++){
        var img = $.cloudinary.image(user.facebookId+'/'+i+'.jpg');
        $scope.fbPicsUrls.push(img[0].src);
      }
    };

    $scope.updateProfile = function(key, bool){
      var data = {
        key: 'details.'+key,
        value: 'private',
        newVal: !bool
      };
      User.update(data);
    };



  });
