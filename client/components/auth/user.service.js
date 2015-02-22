'use strict';

angular.module('friendfinderApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@rid'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
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
