'use strict';

angular.module('friendfinderApp')
  .controller('ActivitiesCtrl', function ($scope, $window, User, Auth, Activity) {

    Activity.get().$promise.then(function(activities){
      $scope.activities = activities;
      console.log(activities.length)
    });

    $('.ui.modal').modal();

    $scope.hideModal = function(){
      $('.ui.modal').modal('hide');
    };
    $scope.showCreate = function(){
      $('.ui.create.modal').modal('show');
    };
    $scope.showEdit = function(activity){
      $scope.selectedActivity = activity;
      $('.ui.edit.modal').modal('show');
    };
    $scope.showDelete = function(activity){
      $scope.selectedActivity = activity;
      $('.ui.delete.modal').modal('show');
    };

    $scope.removeActivity = function(rid){
      $scope.activities = $scope.activities.filter(function(item){
        return item['@rid'] != rid;
      });
    };

    $scope.addActivity = function(item){
      $scope.activities.push(item);
    };


    $scope.isMobile = function(){
      return $window.isMobile;
    };

  });
