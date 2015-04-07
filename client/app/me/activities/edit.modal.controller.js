// 'use strict';
//
// angular.module('friendfinderApp')
//   .controller('EditModalCtrl', function ($scope, Activity, Auth) {
//
//     $scope.currentUser = Auth.getCurrentUser();
//     $scope.loading = false;
//     // $scope.selectedActivity = {};
//
//     $('.ui.dropdown').dropdown();
//     $('.popup.icon').popup({on: 'click'});
//     $('.popup.icon').click(function(e){
//       e.stopPropagation();
//     });
//
//     $scope.setLocation = function(place){
//       if(place.description === 'googlePowered'){
//         return;
//       }
//       $scope.activity.location = place.place_id;
//       $('#location-input-create').val(place.description);
//     };
//
//     $scope.hideModal = function(){
//       $('.ui.edit.modal').modal('hide');
//       $scope.$parent.hideModal();
//       $scope.selectedActivity = {};
//       $scope.selectedActivity.isEvent = 'false';
//       $('#location-input-create').val(undefined);
//     }
//
//     $('#location-input-edit').on('keyup', function(){
//       $scope.selectedActivity.location = undefined;
//       if($('#location-input-edit').val().length > 1){
//         $('.ui.dropdown').dropdown('show');
//         var input = $('#location-input-edit').val();
//         var latlong = $scope.currentUser.location.lat+','+$scope.currentUser.location.long;
//         Activity.autocomplete({input: input, latlong: latlong}).$promise.then(function(suggestions){
//           $scope.suggestions = suggestions;
//           $scope.suggestions.push({description: 'googlePowered'});
//         });
//       } else{
//         $('.ui.dropdown').dropdown('hide');
//       }
//     });
//
//     // pickadate breaks angular binding...
//     $scope.$watchCollection("activity", function(newVal, oldVal){
//       var date = $('#date').val();
//       if(newVal && newVal.isEvent === 'true' && !date){
//         $('.date.asterisk').show();
//       } else {
//         $('.date.asterisk').hide();
//       }
//     });
//
//     var today = new Date();
//     $('#date').pickadate({min: today});
//
//     $('.picker__wrap').click(function(e){
//       $('.ui.create.modal').focus();
//       //TODO focus bug
//     });
//
//     $scope.create = function () {
//       var validations = {
//         title: {
//           identifier: 'title',
//           rules: [{
//             type: 'empty',
//             prompt: 'enter a title'
//           },
//           {
//             type: 'maxLength[40]',
//             prompt: 'too many characters'
//           }]
//         },
//         description: {
//           identifier: 'description',
//           rules: [{
//             type: 'empty',
//             prompt: 'enter a description'
//           },{
//             type: 'maxLength[200]',
//             prompt: 'too many characters'
//           }]
//         },
//         location: {
//           identifier: 'edit-location',
//           rules: [{
//             type: 'empty',
//             prompt: 'choose a location from the dropdown'
//           }]
//         },
//         tags: {
//           identifier: 'tags',
//           rules: [{
//             type: 'empty',
//             prompt: 'you must add at least one tag'
//           },{
//             type: 'maxLength[100]',
//             prompt: 'too many characters'
//           }]
//         }
//       };
//       if($scope.selectedActivity.isEvent === 'true'){
//         validations.date = {
//           identifier: 'date',
//           rules: [{
//             type: 'empty',
//             prompt: 'choose a date'
//           }]
//         };
//         validations.url = {
//           identifier: 'url',
//           rules: [{
//             type: 'url',
//             prompt: 'not a valid URL'
//           },{
//             type: 'maxLength[500]',
//             prompt: 'too many characters'
//           }]
//         };
//       } else {
//         validations.date = undefined;
//       }
//       if($scope.selectedActivity.img){
//         validations.img = {
//           identifier: 'img',
//           rules: [{
//             type: 'url',
//             prompt: 'not a valid URL'
//           },{
//             type: 'maxLength[500]',
//             prompt: 'too many characters'
//           }]
//         };
//       } else {
//         validations.img = undefined;
//       }
//
//       $('.ui.form').form(validations, {on: 'blur', inline: 'true'});
//
//       var self = this;
//       if (!$('.ui.form').form('validate form')[1]) {
//         return;
//       }
//       this.loading = true;
//
//       var activity = {
//         title: $scope.selectedActivity.title,
//         description: $scope.selectedActivity.description,
//         location: $scope.selectedActivity.location,
//         tags: $scope.selectedActivity.tags,
//         isEvent: $scope.selectedActivity.isEvent,
//         date: $scope.selectedActivity.date,
//         url: $scope.selectedActivity.url,
//         img: $scope.selectedActivity.img
//       };
//       console.log('editing', activity)
//       Activity.edit({rid: selectedActivity['@rid'], data: activity}).$promise.then(function(res){
//         self.loading = false;
//         $scope.$parent.hideModal();
//         $scope.selectedActivity = {};
//         $scope.selectedActivity.isEvent = 'false';
//         $('#location-input-edit').val(undefined);
//       });
//
//     };
//
//   });
