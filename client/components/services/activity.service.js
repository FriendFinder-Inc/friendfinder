'use strict';

angular.module('friendfinderApp')
  .factory('Activity', function ($resource) {
    return $resource('/api/activities/:id/:controller', {
      id: '@rid'
    },
    {
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      create: {
        method: 'POST'
      },
      autocomplete: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'autocomplete'
        }
      },
      update: {
        method: 'PUT',
        params: {
          id: 'me',
          controller:'update'
        }
      },
      find: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'find'
        }
      },
      bookmark: {
        method: 'POST',
        params: {
          id: 'me',
          controller: 'bookmark'
        }
      }
	  });
  });
