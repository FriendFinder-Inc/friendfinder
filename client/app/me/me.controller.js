'use strict';

angular.module('friendfinderApp')
  .controller('MeCtrl', function ($scope, User, Auth) {
    $('.me-container .menu .item')
      .tab({
        context : '.me-container',
        // history: true
      })
    ;
  });
