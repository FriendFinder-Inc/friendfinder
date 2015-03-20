'use strict';

angular.module('friendfinderApp')
  .controller('ProfileCtrl', function ($scope, User, Auth, Tag, $state) {
    // $('.ui.dropdown').dropdown();
    $scope.currentUser = {};
    $scope.tagList = [];
    $scope.initialTags = [];
    $scope.profileModified = false;
    $scope.tagsModified = false;

    $scope.detailOptions = {
      gender           :['male', 'female', 'other', '-'],
      distance         :['5mi', '25mi', '100mi', 'anywhere', '-'],
      orientation      :['hetero', 'homo', 'bi', 'other', '-'],
      smokes           :['never', 'occassionally', 'often', '-'],
      drinks           :['never', 'occassionally', 'often', '-'],
      drugs            :['never', 'occassionally', 'often', '-'],
      education        :['some highschool', 'highschool', 'some college', 'associates',
                          'bachelors', 'masters', 'doctorate', '-'],
      diet             :['vegan', 'vegetarian', 'anything', 'Halal', 'Kosher', 'other', '-'],
      job              :['service', 'tech', '-'],
      religion         :['christian', 'hindu', 'jewish', 'muslim', 'buddhist', 'atheist',
                          'agnostic', 'spiritual but not religious', 'other', '-'],
      politics         :['republican', 'democrat', 'independent', 'libertarian', 'other', '-'],
      relationship     :['single', 'not single', '-'],
      // height           :["<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
      //                     "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"],
      cliche           :['hipster', 'yuppie', '-'],
      ethnicity        :['white', 'black', 'hispanic/latin', 'asian', 'indian', 'eastern',
                          'native american', 'pacific islander', 'other', '-'],
      personality      :['INTJ', 'INTP', 'INFJ', 'INFP',
                              'ISFJ', 'ISFP', 'ISTJ', 'ISTP', '-']
    };


    Auth.getCurrentUser().$promise.then(function(user){
      $scope.getFacebookPhotos(user); //TODO refactor service
      $scope.getUserTags();

      $scope.currentUser = user;
      $scope.initialProfile = angular.copy($scope.currentUser.profile);
      $scope.initialDetails = angular.copy($scope.currentUser.details);


      $scope.firstCallDetails = true;
      $scope.$watch('currentUser.details', function(newVal){
        if(!$scope.firstCallDetails){
          console.log()
          if(!angular.equals($scope.initialDetails, $scope.currentUser.details)){
            $scope.profileModified = true;
          } else {
            $scope.profileModified = false;
          }
        }
        $scope.firstCallDetails = false;
      }, true);

      $scope.firstCallProfile = true;
      $scope.$watch('currentUser.profile', function(newVal){
        if(!$scope.firstCallProfile){
          if(!angular.equals($scope.initialProfile, $scope.currentUser.profile)){
            $scope.profileModified = true;
          } else {
            $scope.profileModified = false;
          }
        }
        $scope.firstCallProfile = false;
      }, true);

      $scope.firstCallTags = true;
      $scope.$watch('tagList', function(newVal){
        if(!$scope.firstCallTags){
          if(!angular.equals($scope.initialTags, $scope.tagList)){
            $scope.tagsModified = true;
          } else {
            $scope.tagsModified = false;
          }
        }
        $scope.firstCallTags = false;
      });

    });

    $scope.getFacebookPhotos = function(user){
      $scope.fbPicsUrls = [];
      for(var i = 0; i < 8; i++){
        var img = $.cloudinary.image(user.facebookId+'/'+i+'.jpg');
        $scope.fbPicsUrls.push(img[0].src);
      }
    };

    $scope.updateProfile = function(){
      var data = {
        profile: $scope.currentUser.profile,
        details: $scope.currentUser.details
      };
      User.update(data).$promise.then(function(res){
        $scope.profileModified = false;
        $scope.initialProfile = angular.copy($scope.currentUser.profile);
        $scope.initialDetails = angular.copy($scope.currentUser.details);
      });
    };

    $scope.updateTags = function(){
      // TODO handle duplicates
      var add = [];
      angular.forEach($scope.tagList, function(tag){
        if($scope.initialTags.indexOf(tag) === -1){
          add.push(tag);
        }
      });

      var remove = [];
      angular.forEach($scope.initialTags, function(tag){
        if($scope.tagList.indexOf(tag) === -1){
          remove.push({name: tag, rid: $scope.initialTagsRidMap[tag]});
        }
      });

      // just update what changed
      var data = {
        add: add,
        remove: remove
      };
      Tag.update(data).$promise.then(function(){
        $scope.getUserTags();
      });
    };

    $scope.saveChanges = function(){
      if($scope.profileModified){
        $scope.updateProfile();
      }
      if($scope.tagsModified){
        $scope.updateTags();
      }
    };

    $scope.togglePrivacy = function(key){
      $scope.currentUser.details[key].private = !$scope.currentUser.details[key].private;
    };

    $scope.getUserTags = function(){
      Tag.get().$promise.then(function(tags){
        $scope.tagList = tags.map(function(tag){
          return tag.name;
        });
        $scope.initialTags = tags.map(function(tag){
          return tag.name;
        });
        $scope.initialTagsRidMap = {};
        angular.forEach(tags, function(tag){
          $scope.initialTagsRidMap[tag.name] = tag['@rid'];
        });
        $scope.tagsModified = false;
      });
    };


  });
