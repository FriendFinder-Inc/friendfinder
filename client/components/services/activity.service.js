'use strict';

angular.module('friendfinderApp')
  .factory('Activity', function ($resource) {
    return $resource('/api/activities/:id/:controller', {
      id: '@rid'
    },
    {
      autocomplete: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'autocomplete'
        }
      },
      get: {
        method: 'GET',
        isArray: true
      },
      create: {
        method: 'POST'
      },
      delete: {
        method: 'POST',
        isArray: true,
        params: {
          id: 'me',
          controller:'delete'
        }
      },
      update: {
        method: 'PUT',
        isArray: true,
        params: {
          id: 'me',
          controller:'update'
        }
      },
      request: {
        method: 'POST',
        params: {
          id: 'rid',
          controller: 'request'
        }
      },
      find: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'find'
        }
      }
	  });
  });
