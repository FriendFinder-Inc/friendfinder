'use strict';

angular.module('friendfinderApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@rid'
    },
    {
      get: {
        method: 'GET',
        params: {
          id:'me'
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
      mutualinterests: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'mutualinterests'
        }
      }
	  });
  });
