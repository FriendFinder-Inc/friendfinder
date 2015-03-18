'use strict';

angular.module('friendfinderApp')
  .controller('ProfileCtrl', function ($scope, User, Auth) {
    // $('.ui.dropdown').dropdown();
    $scope.currentUser = {};
    $scope.modified = false;

    $scope.detailOptions = {
      gender           :[{value:'male'}, {value:'female'}, {value:'other'}],
      distance         :[{value:'5mi'}, {value:'25mi'}, {value:'100mi'}, {value:'anywhere'}],
      orientation      :[{value:'hetero'}, {value:'homo'}, {value:'bi'}, {value:'other'}],
      smokes           :[{value:'never'}, {value:'occassionally'}, {value:'often'}],
      drinks           :[{value:'never'}, {value:'occassionally'}, {value:'often'}],
      drugs            :[{value:'never'}, {value:'occassionally'}, {value:'often'}],
      education        :[{value:'some highschool'}, {value:'highschool'}, {value:'some college'}, {value:'associates'},
                          {value:'bachelors'}, {value:'masters'}, {value:'doctorate'}],
      diet             :[{value:'vegan'}, {value:'vegetarian'}, {value:'anything'}, {value:'Halal'}, {value:'Kosher'}, {value:'other'}],
      job              :[{value:'service'}, {value:'tech'}],
      religion         :[{value:'christian'}, {value:'hindu'}, {value:'jewish'}, {value:'muslim'}, {value:'buddhist'}, {value:'atheist'},
                          {value:'agnostic'}, {value:'spiritual but not religious'}, {value:'other'}],
      politics         :[{value:'republican'}, {value:'democrat'}, {value:'independent'}, {value:'libertarian'}, {value:'other'}],
      relationship     :[{value:'single'}, {value:'not single'}],
      // height           :[{value:"<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
      //                     "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"}],
      cliche           :[{value:'hipster'}, {value:'yuppie'}],
      ethnicity        :[{value:'white'}, {value:'black'}, {value:'hispanic/latin'}, {value:'asian'}, {value:'indian'}, {value:'eastern'},
                          {value:'native american'}, {value:'pacific islander'}, {value:'other'}],
      personality      :[{value:'INTJ'}, {value:'INTP'}, {value:'INFJ'}, {value:'INFP'},
                              {value:'ISFJ'}, {value:'ISFP'}, {value:'ISTJ'}, {value:'ISTP'}]
    };


    Auth.getCurrentUser().$promise.then(function(user){
      $scope.currentUser = user;
      $scope.getFacebookPhotos(user); //TODO refactor service

      $scope.firstCall = true;

      $scope.$watchGroup(['currentUser.profile.intro',
                          'currentUser.profile.idealWeekend',
                          'currentUser.profile.dreamDestination',
                          'currentUser.profile.details'],
                            function(newValues, oldValues) {

        if(!$scope.firstCall){
          $scope.modified = true;
          console.log('i', currentUser.details)
        }
        $scope.firstCall = false;
      });
    });

    $scope.getFacebookPhotos = function(user){
      $scope.fbPicsUrls = [];
      for(var i = 0; i < 8; i++){
        var img = $.cloudinary.image(user.facebookId+'/'+i+'.jpg');
        $scope.fbPicsUrls.push(img[0].src);
      }
    };

    $scope.updateProfile = function(key, bool){
      var data = {
        key: 'details.'+key,
        value: 'private',
        newVal: !bool
      };
      User.update(data);
    };

    $scope.showDropdown = function(key){
      console.log(key)
      $('#dropdown-'+key).dropdown({action: 'show'});
    };

    $scope.getUserInterests = function(){
      console.log('interests')
    };


  });
