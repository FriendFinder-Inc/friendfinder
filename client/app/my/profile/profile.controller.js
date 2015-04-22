'use strict';

angular.module('friendfinderApp')
  .controller('ProfileCtrl', function ($scope, User, Auth, Tag, $state) {

    $scope.$on('onRepeatLast', function(scope, element, attrs){
      setTimeout(function(){
        $('.ui.selection.dropdown.details').dropdown();
      }, 1);
    });

    $scope.currentUser = {};
    $scope.interests = {};
    $scope.interests.tags = [];
    $scope.interests.meetups = [];
    $scope.initialTags = [];
    $scope.profileModified = false;
    $scope.tagsModified = false;

    $scope.detailOptions = {
      gender           :['male', 'female', 'other', '-'],
      distance         :['5mi', '25mi', '100mi', 'anywhere', '-'],
      orientation      :['straight', 'gay', 'bi', 'other', '-'],
      smokes           :['never', 'occassionally', 'often', '-'],
      drinks           :['never', 'occassionally', 'often', '-'],
      drugs            :['never', 'occassionally', 'often', '-'],
      education        :['some highschool', 'highschool', 'some college', 'associates',
                          'bachelors', 'masters', 'doctorate', '-'],
      diet             :['vegan', 'vegetarian', 'anything', 'Halal', 'Kosher', 'other', '-'],
      job              :["administration", "art / music / writing", "banking / finance", "construction",
                          "education", "entertainment / media", "food", "hospitality", "law", "management", "medicine",
                          "military", "politics / government", "retail", "sales / marketing", "science / engineering",
                          "student", "technology", "transportation", "other"],
      religion         :['christian', 'hindu', 'jewish', 'muslim', 'buddhist', 'atheist',
                          'agnostic', 'spiritual but not religious', 'other', '-'],
      politics         :['republican', 'democrat', 'independent', 'libertarian', 'other', '-'],
      relationship     :['single', 'not single', '-'],
      // height           :["<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
      //                     "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"],
      ethnicity        :['white', 'black', 'hispanic/latin', 'asian', 'indian', 'eastern',
                          'native american', 'pacific islander', 'other', '-'],
      personality      :['INTJ', 'INTP', 'INFJ', 'INFP',
                          'ISFJ', 'ISFP', 'ISTJ', 'ISTP', '-']
    };


    Auth.getCurrentUser().$promise.then(function(user){
      $scope.getFacebookPhotos(user); //TODO refactor service

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

      $scope.firstCallInterests = true;
      $scope.$watch('interests', function(newVal){
        if(!$scope.firstCallInterests){
          var tagNames = $scope.interests.tags.map(function(item){
            return item.name;
          });
          var meetupNames = $scope.interests.meetups.map(function(item){
            return item.name;
          });
          if(!angular.equals($scope.initialTags, tagNames)){
            $scope.tagsModified = true;
          } else {
            $scope.tagsModified = false;
          }
          if(!angular.equals($scope.initialMeetups, meetupNames)){
            $scope.meetupsModified = true;
          } else {
            $scope.meetupsModified = false;
          }
        }
        $scope.firstCallInterests = false;
      }, true);

    });

    // angular binding isn't playing with semantic dropdown...
    $scope.optionSelected = function(key, value){
      $scope.currentUser.details[key].value = value;
      //hacky...
      $('.text.ng-binding').css('max-height', '14px');
      $('.text.ng-binding').css('max-width', '65px');
      $('.text.ng-binding').css('overflow', 'hidden');
    };

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
        $scope.loading = false;
      });
    };

    $scope.loading = false;
    $scope.saveChanges = function(){
      if($scope.profileModified){
        $scope.loading = true;
        $scope.updateProfile();
      }
      if($scope.tagsModified){
        $scope.loading = true;
        $scope.updateTags();
      }
      if($scope.meetupsModified){
        $scope.loading = true;
        $scope.updateMeetups();
      }
    };

    $scope.togglePrivacy = function(key){
      $scope.currentUser.details[key].private = !$scope.currentUser.details[key].private;
    };

    $scope.getUsersTags = function(){
      Tag.get().$promise.then(function(tags){
        $scope.interests.tags = tags.map(function(tag){
          return tag;
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

    $scope.getUsersMeetups = function(){
      User.meetups({rid: $scope.currentUser['@rid']}).$promise.then(function(meetups){
        $scope.interests.meetups = meetups;
        $scope.initialMeetups = meetups.map(function(meetup){
          return meetup.name;
        });
        $scope.meetupsModified = false;
      });
    };

    $scope.showInterests = false;
    $scope.firstCall = true;
    $scope.toggleInterests = function(){
      if(!$scope.showInterests && $scope.firstCall){
        $scope.interests = {};
        $scope.interests.tags = [];
        $scope.interests.meetups = [];
        $scope.getUsersTags($scope.selectedUser);
        $scope.getUsersMeetups($scope.selectedUser);
        $scope.firstCall = false;
        $('#add-tags-input').keypress(function(e){
          if(e.which === 13){
            if($scope.validateTagInput()){
              $('#add-tags-input').val('');
              var add = [];
              var tagNames = $scope.interests.tags.map(function(item){
                return item.name;
              });
              angular.forEach($scope.newTags, function(tag){
                if(tagNames.indexOf(tag) === -1 &&
                    add.indexOf(tag) === -1){
                  $scope.interests.tags.push({name: tag});
                  $scope.$apply(function(){});
                }
              });
            }
          }
        });
        $('#add-tags-btn').click(function(e){
          if($scope.validateTagInput()){
            $('#new-tag-input').val('');
            var add = [];
            var tagNames = $scope.interests.tags.map(function(item){
              return item.name;
            });
            angular.forEach($scope.newTags, function(tag){
              if(tagNames.indexOf(tag) === -1 &&
                  add.indexOf(tag) === -1){
                $scope.interests.tags.push({name: tag});
                $scope.$apply(function(){});
              }
            });
          }
        });
      }
      $scope.showInterests = !$scope.showInterests;
    };

    $scope.newTags = [];
    $scope.deletedTags = [];
    $scope.updateTags = function(){
      var add = [];
      var tagNames = $scope.interests.tags.map(function(item){
        return item.name;
      });
      angular.forEach($scope.interests.tags, function(tag){
        if($scope.initialTags.indexOf(tag.name) === -1){
          add.push(tag.name);
        }
      });
      var data = {
        add: add,
        remove: $scope.deletedTags
      };
      Tag.update(data).$promise.then(function(){
        $scope.getUsersTags();
        $scope.loading = false;
      });
    };

    $scope.deletedMeetups = [];
    $scope.updateMeetups = function(){
      User.removemeetups({rids: $scope.deletedMeetups}).$promise.then(function(){
        $scope.getUsersMeetups();
        $scope.loading = false;
      });
    };

    $scope.removeInterest = function(item){
      if(item['@class'] === 'Tag'){
        angular.forEach($scope.interests.tags, function(tag, index){
          if(tag['@rid'] === item['@rid']){
            $scope.deletedTags.push({rid: tag['@rid']});
            $scope.interests.tags.splice(index, 1);
            return;
          }
        });
      } else if (item['@class'] === 'Meetup'){
        angular.forEach($scope.interests.meetups, function(meetup, index){
          if(meetup['@rid'] === item['@rid']){
            $scope.deletedMeetups.push(meetup['@rid']);
            $scope.interests.meetups.splice(index, 1);
            return;
          }
        });
      } else { // new tag that hasn't been saved yet
        angular.forEach($scope.interests.tags, function(tag, index){
          if(tag.name === item.name){
            $scope.interests.tags.splice(index, 1);
            return;
          }
        });
      }
    };

    $scope.validateTagInput = function(){
      return true; //TODO: below not working
      var validations = {
        title: {
          identifier: 'new-tag-input',
          rules: [{
            type: 'empty',
            prompt: 'enter a tag'
          },
          {
            type: 'maxLength[2]',
            prompt: 'too many characters'
          }]
        }
      };

      $('.ui.form.tags').form(validations, {on: 'blur', inline: 'true'});

      var result = $('.ui.form.tags').form('validate form');
      return result[result.length-1];
    };

  });
