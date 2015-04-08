'use strict';

angular.module('friendfinderApp')
  .controller('SettingsCtrl', function ($scope, User, Auth, $state) {
    $('.settings-container .menu .item')
      .tab({
        context : '.settings-container',
        // history: true
      });
      $scope.$on('$stateChangeSuccess', function(event, toState) {
        $('.item').removeClass('active');
        $('.ui.tab.label').removeClass('active');


        $("[ui-sref='"+$state.current.name+"']").addClass('active');
        $("[data-tab='"+$state.current.name.split('.')[1]+"']").addClass('active');
      });

      $scope.isActive = function(tab){
        if(tab === $state.current.name.split('.')[2]){
          return true;
        } else {
          return false;
        }
      };
  });
