'use strict';

angular.module('friendfinderApp')
  .factory('Tag', function ($resource) {
    return $resource('/api/tags/:id/:controller', {
      id: '@rid'
    },
    {
      get: {
        method: 'GET',
        isArray: true
      },
      update: {
        method: 'PUT'
      },
      delete: {
        method: 'POST',
        params: {
          id: 'me',
          controller: 'find'
        }
      }
	  });
  });
