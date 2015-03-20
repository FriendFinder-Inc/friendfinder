'use strict';

angular.module('friendfinderApp')
  .controller('MeCtrl', function ($scope, User, Auth, $state) {
    $('.me-container .menu .item')
      .tab({
        context : '.me-container',
        // history: true
    });

    $("[ui-sref='"+$state.current.name+"']").addClass('active');
    $("[data-tab='"+$state.current.name.split('.')[1]+"']").addClass('active');
  });
