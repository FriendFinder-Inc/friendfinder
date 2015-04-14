'use strict';

angular.module('friendfinderApp')
  .factory('Profile', function Auth($rootScope, User, Activity, Auth, $cookieStore) {
    var selectedUser = '';
    var currentUser = Auth.getCurrentUser();

    return {

      getUser: function(rid, cb) {
        if(selectedUser['@rid'] === rid){
          cb(selectedUser);
        } else {
          User.getById({rid: rid}).$promise.then(function(user){
            selectedUser = user;
            cb(user);
          });
        }
      },

      getProfilePhotos: function(cb){
        var imgUrls = [];
        for(var i = 0; i < 8; i++){
          var img = $.cloudinary.image(selectedUser.facebookId+'/'+i+'.jpg');
          imgUrls.push(img[0].src);
        }
        cb(imgUrls);
      },

      getMutualInterests: function(cb){
        var mutualInterests = {};
        mutualInterests.pages = [];
        mutualInterests.tags = [];
        User.mutualinterests({rid: selectedUser['@rid']}).$promise.then(function(mutual){
          var token = {
            access_token: currentUser.fbAccessToken
          };
          var count = 0;
          angular.forEach(mutual, function(like){
            if(like['@class'] === 'Page'){
              FB.api('/'+like.id, token,function(res){
                FB.api('/'+like.id+'/picture', token,function(img){
                  mutualInterests.pages.push({
                    name: res.name,
                    link: res.link,
                    img: img.data.url
                  });
                  if(++count === mutual.length){
                    cb(mutualInterests);
                  }
                });
              });
            } else { //tag
              $scope.mutualInterests.tags.push({name: like.name});
              if(++count === mutual.length){
                cb(mutualInterests);
              }
            }
          });
        });
      },

      getMutualFriendsOrPath: function(cb){
        User.mutualfriends({rid: selectedUser['@rid']}).$promise.then(function(mutual){
          if(!mutual.length){
            User.getConnectionPath({rid: selectedUser['@rid']}).$promise.then(function(path){
              cb('path', path);
            });
          } else {
            cb('friends', mutual);
          }
        });
      },

      getMutualMeetups: function(cb){
        User.mutualmeetups({rid: selectedUser['@rid']}).$promise.then(function(mutual){
          cb(mutual);
        });
      },

      getUsersActivities: function(cb){
        Activity.get({rid: selectedUser['@rid']}).$promise.then(function(activities){
          cb(activities);
        });
      },

      getUsersMeetups: function(cb){
        User.meetups({rid: selectedUser['@rid']}).$promise.then(function(meetups){
          cb(meetups);
        });
      },

      getUsersInterests: function(cb){
        var allInterests = {};
        allInterests.tags = [];
        User.interests({rid: selectedUser['@rid']}).$promise.then(function(likes){
          angular.forEach(likes, function(like){
            if(like['@class'] === 'Tag'){
              allInterests.tags.push(like);
            } else {
              //TODO: show fb likes?
            }
          });
          cb(allInterests);
        });
      }

    };
  });
