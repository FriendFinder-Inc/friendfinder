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
      getById: {
        method: 'GET'
      },
      getConnectionPath: {
        method: 'GET',
        isArray: true,
        params: {
          id:'me',
          controller: 'connectionpath'
        }
      },
      delete: {
        method: 'DELETE',
        isArray: true,
        params: {
          id:'me'
        }
      },
      removemeetups: {
        method: 'DELETE',
        params: {
          id:'me',
          controller: 'meetups'
        }
      },
      // disable: {
      //   method: 'PUT',
      //   params: {
      //     id:'me'
      //   }
      // },
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
      },
      removeBookmark: {
        method: 'DELETE',
        params: {
          id: 'me',
          controller: 'bookmark'
        }
      },
      bookmarks: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'bookmarks'
        }
      },
      requests: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'requests'
        }
      },
      activities: {
        method: 'GET',
        isArray: true,
        params: {
          controller: 'activities'
        }
      },
      interests: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'rid',
          controller: 'interests'
        }
      },
      meetups: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'rid',
          controller: 'meetups'
        }
      },
      mutualinterests: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'mutualinterests'
        }
      },
      mutualfriends: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'mutualfriends'
        }
      },
      mutualmeetups: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'mutualmeetups'
        }
      }
	  });
  });
