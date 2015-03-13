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
        url: '/account',
        templateUrl: 'app/settings/account/account.html',
        controller: 'AccountCtrl'
      })
      .state('settings.feedback', {
        url: '/feedback',
        templateUrl: 'app/settings/feedback/feedback.html',
        controller: 'FeedbackCtrl'
      })
      .state('settings.about', {
        url: '/about',
        templateUrl: 'app/settings/about/about.html',
        controller: 'AboutCtrl'
      })
      .state('settings.about.privacy', {
        url: '/privacy',
        templateUrl: 'app/settings/about/aboutPrivacy.html',
        controller: 'AboutCtrl'
        // authenticate: true
      })
      .state('settings.about.terms', {
        url: '/terms',
        templateUrl: 'app/settings/about/aboutTerms.html',
        controller: 'AboutCtrl'
        // authenticate: true
      });
  });
