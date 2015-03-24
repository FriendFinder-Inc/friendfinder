'use strict';

angular.module('friendfinderApp')
  .controller('CreateModalCtrl', function ($scope, $element, Activity) {

    $scope.loading = false;
    $scope.showDateAsterisk = false;
    $scope.activity = {};
    $scope.activity.isEvent = "false";

    $('.ui.dropdown').dropdown();

    $scope.setLocation = function(place){
      $scope.activity.location = place.place_id;
      $('#location-input-create').val(place.description);
    };

    $('#location-input-create').on('keyup', function(){
      $scope.activity.location = undefined;
      if($('#location-input-create').val().length > 1){
        $('.ui.dropdown').dropdown('show');
        var input = $('#location-input-create').val();
        Activity.autocomplete({input: input}).$promise.then(function(suggestions){
          $scope.suggestions = suggestions;
          $scope.suggestions.push({description: 'TODO google logo'});
        });
      } else{
        $('.ui.dropdown').dropdown('hide');
      }
    });

    // pickadate is breaking angular binding for some reason
    $scope.$watchGroup(['activity.date', 'activity.isEvent'], function(){
      var date = $('#date').val();
      if($scope.activity.isEvent === 'true' && !date){
        $('#date-asterisk').show();
      } else {
        $('#date-asterisk').hide();
      }
    });

    var registrationForm = $($element);
    var today = new Date();
    $('#date').pickadate({min: today});

    $scope.isInvalid = function() {
      return !registrationForm.form('validate form');
    };

    $scope.create = function () {
      var validations = {
        title: {
          identifier: 'title',
          rules: [{
            type: 'empty',
            prompt: 'enter a title'
          }]
        },
        description: {
          identifier: 'description',
          rules: [{
            type: 'empty',
            prompt: 'enter a description'
          }]
        },
        location: {
          identifier: 'location',
          rules: [{
            type: 'empty',
            prompt: 'choose a location from the dropdown'
          }]
        },
        tags: {
          identifier: 'tags',
          rules: [{
            type: 'empty',
            prompt: 'you must add at least one tag'
          }]
        }
      };
      if($scope.activity.isEvent === 'true'){
        validations.date = {
          identifier: 'date',
          rules: [{
            type: 'empty',
            prompt: 'choose a date'
          }]
        };
        validations.url = {
          identifier: 'url',
          rules: [{
            type: 'url',
            prompt: 'not a valid URL'
          }]
        };
      }
      if($scope.activity.img){
        validations.img = {
          identifier: 'img',
          rules: [{
            type: 'url',
            prompt: 'not a valid URL'
          }]
        };
      }

      (function ($) {
        $('.ui.form').form(validations, {on: 'blur', inline: 'true'});
      }(jQuery));

      var self = this;
      if (this.isInvalid()) {
        return;
      }
      this.loading = true;

      var activity = {
        title: $scope.activity.title,
        description: $scope.activity.description,
        location: $scope.activity.location,
        tags: $scope.activity.tags,
        isEvent: $scope.activity.isEvent,
        date: $scope.activity.date,
        url: $scope.activity.url,
        img: $scope.activity.img
      };
      Activity.create({data: activity}).$promise.then(function(res){
        console.log('man, ', res)
        $scope.addActivity(res);
        self.loading = false;
        $scope.hideModal();
      });

    };

  });
