'use strict';

angular.module('friendfinderApp')
  .factory('Message', function ($resource) {
    return $resource('/api/messages/:id/:controller', {
      id: '@rid'
    },
    {
      get: {
        method: 'GET',
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
      }
	  });
  });
