'use strict';

angular.module('friendfinderApp')
  .controller('CreateModalCtrl', function ($scope, Activity, Auth) {

    $scope.currentUser = Auth.getCurrentUser();
    $scope.loading = false;
    $scope.activity = {};
    $scope.activity.isEvent = "false";

    $('.ui.dropdown').dropdown();
    $('.popup.icon').popup({on: 'click'});
    $('.popup.icon').click(function(e){
      e.stopPropagation();
    });

    $scope.setLocation = function(place){
      if(place.description === 'googlePowered'){
        return;
      }
      $scope.activity.location = place.place_id;
      $('#location-input-create').val(place.description);
    };

    $scope.hideModal = function(){
      $('.ui.create.modal').modal('hide');
      $scope.$parent.hideModal();
      $scope.activity = {};
      $scope.activity.isEvent = 'false';
      $('#location-input-create').val(undefined);
    }

    $('#location-input-create').on('keyup', function(){
      $scope.activity.location = undefined;
      if($('#location-input-create').val().length > 1){
        $('.ui.dropdown.location').dropdown('show');
        var input = $('#location-input-create').val();
        var latlong = $scope.currentUser.lat+','+$scope.currentUser.long;
        Activity.autocomplete({input: input, latlong: latlong}).$promise.then(function(suggestions){
          $scope.suggestions = suggestions;
          $scope.suggestions.push({description: 'googlePowered'});
        });
      } else{
        $('.ui.dropdown.location').dropdown('hide');
      }
    });

    // pickadate breaks angular binding...
    $scope.$watchCollection("activity", function(newVal, oldVal){
      var date = $('#date').val();
      if(newVal.isEvent === 'true' && !date){
        $('.date.asterisk').show();
      } else {
        $('.date.asterisk').hide();
      }
    });

    var today = new Date();
    $('#date').pickadate({min: today});

    $('#date-input').click(function(e){
      $('.picker__holder').css('display', 'inline');
    });

    $('.picker__wrap').click(function(e){
      $('.picker__holder').css('display', 'none');
    });

    $scope.create = function () {
      var validations = {
        title: {
          identifier: 'title',
          rules: [{
            type: 'empty',
            prompt: 'enter a title'
          },
          {
            type: 'maxLength[40]',
            prompt: 'too many characters'
          }]
        },
        description: {
          identifier: 'description',
          rules: [{
            type: 'empty',
            prompt: 'enter a description'
          },{
            type: 'maxLength[220]',
            prompt: 'too many characters'
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
          },{
            type: 'maxLength[100]',
            prompt: 'too many characters'
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
          },{
            type: 'maxLength[500]',
            prompt: 'too many characters'
          }]
        };
      } else {
        validations.date = undefined;
      }
      if($scope.activity.img){
        validations.img = {
          identifier: 'img',
          rules: [{
            type: 'url',
            prompt: 'not a valid URL'
          },{
            type: 'maxLength[500]',
            prompt: 'too many characters'
          }]
        };
      } else {
        validations.img = undefined;
      }

      $('.ui.form').form(validations, {on: 'blur', inline: 'true'});

      var self = this;
      var result = $('.ui.form').form('validate form');
      if (!result[result.length-1]) {
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
        $scope.$parent.$parent.addActivity(res);
        self.loading = false;
        $scope.$parent.closeModals();
        $scope.activity = {};
        $scope.activity.isEvent = 'false';
        $('#location-input-create').val(undefined);
      });

    };

  });
