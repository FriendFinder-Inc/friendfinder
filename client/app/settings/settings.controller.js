'use strict';

angular.module('friendfinderApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {
    $('.settings.container .menu .item')
      .tab({
        context : '.center.aligned.segment'
      })
    ;
  });
