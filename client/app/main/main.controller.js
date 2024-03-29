'use strict';

angular.module('friendfinderApp')
  .controller('MainCtrl', function ($scope, $http, $window) {

    $scope.fbLogin = function(){

      var scope = ['email',
                  'public_profile',
              		'user_friends',
              		'user_location',
              		'user_birthday',
              		'user_likes',
              		'user_photos',
              		'user_hometown',
              		'user_work_history',
              		'user_education_history'];

      FB.login(function(response) {

        $http.post('/auth/facebook', {facebookId: response.authResponse.userID,
                                      accessToken: response.authResponse.accessToken })
        .success(function(data, status, headers, config) {
          $window.location.href = '/my/profile';
        })
        .error(function(data, status, headers, config) {
          console.log('error')
          $window.location.href = '/';
        });
      }, {scope: scope.toString()});
    };

    $scope.showModal = function(){
      $('.ui.modal.video-intro').modal('show');
    };

    $('.ui.modal.video-intro').modal('setting', {
      onHide: function(){
        console.log('hi')
        var video = $("#intro-video").attr("src");
        $("#intro-video").attr("src","");
        $("#intro-video").attr("src",video);
      }
    });

    $scope.isMobile = function(){
      return $window.isMobile;
    };

  });
