'use strict';

angular.module('friendfinderApp')
  .controller('ActivitiesCtrl', function ($scope, $window, User, Auth, Activity) {

    $scope.activities = [];
    $scope.currentUser = Auth.getCurrentUser();

    $scope.$parent.$parent.$watch('myActivities', function(newVal, oldVal){
      $scope.activities = newVal;
    });

    $scope.isTriple = function(i){
      return (i === 0) || (i % 3 === 0);
    };
    $scope.isDouble = function(i){
      return (i === 0) || (i % 2 === 0);
    };

    $scope.isTooSmall = function(){
      return window.innerWidth < 1100;
    };

    $('.ui.modal').modal();

    $scope.hideModal = function(){
      $('.ui.modal').modal('hide');
    };
    $scope.showCreate = function(){
      $('.ui.create.modal').modal('show');
    };

    $scope.$on('onRepeatLast', function(scope, element, attrs){
      $('.activity-title').textfill({});
      $('.activity-location').textfill({});
    });
    // $scope.showEdit = function(activity){
    //   $scope.selectedActivity = activity;
    //   console.log('open', $scope.selectedActivity)
    //   $('.ui.edit.modal').modal('show');
    // };
    $scope.showDelete = function(activity){
      $scope.selectedActivity = activity;
      $('.ui.delete.modal').modal('show');
    };

    $scope.removeActivity = function(rid){
      $scope.activities = $scope.activities.filter(function(item){
        return item['@rid'] != rid;
      });
    };

    $scope.isMobile = function(){
      return $window.isMobile;
    };

    $scope.prettyDate = function(dateStr){
      return moment(dateStr).format('ll');
    };

  });
