'use strict';

angular.module('friendfinderApp')
  .controller('ActivitiesCtrl', function ($scope, User, Auth) {

    $('.ui.modal').modal();

    $scope.showModal = function(){
      $('.ui.modal').modal('show');
    };

    $scope.hideModal = function(){
      $('.ui.modal').modal('hide');
    };

    $scope.RegisterController = function($scope, $element) {
      $scope.loading = false;
      $scope.activity = {};
      $scope.activity.isEvent = "false";

      var registrationForm = $($element);
      $("#location").geocomplete();
      $('#date').pickadate();

      $scope.isInvalid = function() {
        return !registrationForm.form('validate form');
      };

      $scope.create = function () {
        if (this.isInvalid()) {
          return;
        }
        this.loading = true;

        console.log('activity', $scope.activity)
      };
    };

    (function ($) {
      $('.ui.form').form({
        title: {
          identifier: 'title',
          rules: [{
            type: 'empty',
            prompt: 'please enter a title'
          }]
        },
        description: {
          identifier: 'description',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your surname'
          }]
        },
        location: {
          identifier: 'location',
          rules: [{
            type: 'empty',
            prompt: 'Please enter a username'
          }]
        },
        date: {
          identifier: 'date',
          rules: [{
            type: 'empty',
            prompt: 'Please enter a password'
          },{
            type: 'length[6]',
            prompt: 'Password needs to be atleast 6 characters long'
          }]
        },
        url: {
          identifier: 'url',
          rules: [{
            type: 'url',
            prompt: 'not a valid URL'
          }]
        },
        img: {
          identifier: 'img',
          rules: [{
            type: 'url',
            prompt: 'not a valid URL'
          }]
        },
        tags: {
          identifier: 'tags',
          rules: [{
            type: 'empty',
            prompt: 'you must add at least one tag'
          }]
        }
      }, {
        on: 'blur',
        inline: 'true'
      });
    }(jQuery));

  });
