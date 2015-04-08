'use strict';

angular.module('friendfinderApp')
  .controller('AccountCtrl', function ($scope, User, Auth, $window, $cookieStore) {

    $scope.currentUser = Auth.getCurrentUser();
    $scope.initialPrefs = angular.copy($scope.currentUser.preferences);

    $('.popup.icon').popup({on: 'click'});
    $('.popup.icon').click(function(e){
      e.stopPropagation();
    });

    $scope.linkModal = function(){
      $('.ui.small.modal.delete').modal();
    };

    $scope.meetupAuth = function(){
      var url = '/auth/meetup?access_token='+$cookieStore.get('token');
      $window.location.href = url;
    };

    // $scope.facebookSync = function(){
    //
    // };

    $scope.checkboxClicked = function(key, value){
      $scope.currentUser.preferences[key][value] = !$scope.currentUser.preferences[key][value];
    };

    $scope.save = function(){
      if($scope.accountModified){
        $scope.updateUser();
      }
    };

    $scope.$watch('currentUser.preferences', function(newVal){
      if(!$scope.firstCall){
        if(!angular.equals($scope.initialPrefs, $scope.currentUser.preferences)){
          $scope.accountModified = true;
        } else {
          $scope.accountModified = false;
        }
      }
      $scope.firstCall = false;
    }, true);

    $scope.updateUser = function(){
      User.update({preferences: $scope.currentUser.preferences}).$promise.then(function(res){
        $scope.accountModified = false;
        $scope.initialPrefs = angular.copy($scope.currentUser.preferences);
      });
    };

    $scope.showDeleteModal = function(){
      $('.ui.small.modal.delete').modal('show');
    };

    $scope.hideModal = function(){
      $('.ui.small.modal.delete').modal('hide');
    };

    $scope.delete = function(){
      User.delete({rid: $scope.currentUser['@rid']}).$promise.then(function(res){
        $window.location.href = '/';
      });
    };

  });
