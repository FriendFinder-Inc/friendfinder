'use strict';

angular.module('friendfinderApp')
  .factory('Message', function ($resource) {
    return $resource('/api/messages/:id/:controller', {
      id: '@rid'
    },
    {
      get: {
        method: 'GET',
        isArray: true,
        params: {
          id:'me'
        }
      },
      send: {
        method: 'POST',
        params: {
          id: 'me',
          controller: 'send'
        }
      },
      update: {
        method: 'PUT',
        params: {
          id: 'me',
          controller: 'update'
        }
      }
	  });
  });
