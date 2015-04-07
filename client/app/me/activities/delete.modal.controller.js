'use strict';

angular.module('friendfinderApp')
  .controller('DeleteModalCtrl', function ($scope, Activity) {

    $scope.delete = function(){
      Activity.delete({
        owner: $scope.selectedActivity.creator,
        rid: $scope.selectedActivity['@rid']
      })
      .$promise.then(function(res){
        $scope.removeActivity($scope.selectedActivity['@rid']);
        $scope.hideModal();
      });
    };

  });
