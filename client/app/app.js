// 'use strict';

angular.module('friendfinderApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
    .when('/my', '/my/messages')
    .when('/find', '/find/friends')
    .when('/settings', '/settings/account')
    .otherwise('/')

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })


  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      //TODO
      responseError: function(response) {
        if(response.status === 401) {
          // remove any stale tokens
          $cookieStore.remove('token');
          $location.path('/');
          $('#navbar').remove();
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth, $cookieStore) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/');
        }
        // don't let user go back to login if already logged in
        if (next.url === '/' && $cookieStore.get('token')) {
          $location.path('/my/profile');
        }
        // kind of hacky, but if removed there is a benign UI bug on the sidebar
        if(next.name === 'findfriends' || next.name === 'findactivities'){
          $('.item').removeClass('active');
        }
      });
    });
  });
