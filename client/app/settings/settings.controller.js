'use strict';

angular.module('friendfinderApp')
  .controller('SettingsCtrl', function ($scope, User, Auth, $state) {
    $('.settings-container .menu .item')
      .tab({
        context : '.settings-container',
        // history: true
      });

      $("[ui-sref='"+$state.current.name+"']").addClass('active');
      $("[data-tab='"+$state.current.name.split('.')[1]+"']").addClass('active');
  });
