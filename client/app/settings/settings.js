'use strict';

angular.module('friendfinderApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/settings/settings.html',
        controller: 'SettingsCtrl'
      })
      .state('settings.account', {
        url: '/account'
      })
      .state('settings.feedback', {
        url: '/feedback'
      })
      .state('settings.about', {
        url: '/about'
      })
      .state('settings.about.privacy', {
        url: '/privacy'
      })
      .state('settings.about.terms', {
        url: '/terms'
      })
      .state('settings.about.mission', {
        url: '/mission'
        // authenticate: true TODO
      });
  });
