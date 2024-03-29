'use strict';

angular.module('friendfinderApp')
  .filter('offset', function() { //limitTo:x:begin not working...
    return function(input, start) {
      start = parseInt(start, 10);
      return input.slice(start);
    };
  });

angular.module('friendfinderApp')
  .controller('FindFriendsCtrl', function ($scope, $http, $window, Auth, User, Profile) {

    $(window).load(function() {
      setTimeout(function(){
        $('.intro-wrapper').flowtype({
         minimum   : 250,
         maximum   : 800,
         minFont   : 10,
         maxFont   : 72,
         fontRatio : 25
        });
        $('.middle').flowtype({
         minimum   : 80,
         maximum   : 700,
         minFont   : 12,
         maxFont   : 150,
         fontRatio : 14
        });
      }, 1);
    });

    setTimeout(function(){
      $('.intro-wrapper').flowtype({
       minimum   : 250,
       maximum   : 800,
       minFont   : 10,
       maxFont   : 72,
       fontRatio : 25
      });
      $('.middle').flowtype({
       minimum   : 80,
       maximum   : 700,
       minFont   : 12,
       maxFont   : 150,
       fontRatio : 14
      });
    }, 1);

    $scope.linkAccordion = function(){
      $('.ui.accordion').accordion();
    };

    $scope.tags = {};
    $scope.tags.list = [];
    $scope.showTags = true;
    $scope.ageRange = {};
    $scope.ageRange.val = '';
    $scope.showAgeRange = false;

    $scope.orderby = [{'key':'orderby', 'options':['distance',
                      'mutual interests', 'mutual friends', 'mutual meetups']}];

    $scope.filterChoices =
     [{'key':'gender',           'options':['male', 'female', 'other']},
      {'key':'distance',         'options':['5mi', '25mi', '50mi', '100mi', 'anywhere']},
      {'key':'orientation',      'options':['straight', 'gay', 'bi', 'other']},
      // {'key':'last online',      'options':['online now', 'past week', 'past month']},
      {'key':'smokes',           'options':['never', 'occassionally', 'often']},
      // {'key':'activities',       'options':['has activities']},
      {'key':'drinks',           'options':['never', 'occassionally', 'often']},
      // {'key':'connection',       'options':['3rd degree', '4th degree', '5th degree', '6th degree', '7th degree']},
      {'key':'drugs',            'options':['never', 'occassionally', 'often']},
      {'key':'education',        'options':['some highschool', 'highschool', 'some college', 'associates',
        'bachelors', 'masters', 'doctorate']},
      {'key':'diet',             'options':['vegan', 'vegetarian', 'anything', 'Halal', 'Kosher', 'other']},
      {'key':'job',              'options':["administration", "art / music / writing", "banking / finance", "construction",
                                    "education", "entertainment / media", "food", "hospitality", "law", "management", "medicine",
                                    "military", "politics / government", "retail", "sales / marketing", "science / engineering",
                                    "student", "technology", "transportation", "other"]},
      {'key':'religion',         'options':['christian', 'hindu', 'jewish', 'muslim', 'buddhist', 'atheist',
        'agnostic', 'spiritual but not religious', 'other']},
      {'key':'politics',         'options':['republican', 'democrat', 'independent', 'libertarian', 'other']},
      {'key':'relationship',     'options':['single', 'not single']},
      // {'key':'height',           'options':["<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
      //   "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"]},
      {'key':'ethnicity',        'options':['white', 'black', 'hispanic/latin', 'asian', 'indian', 'middle eastern',
        'native american', 'pacific islander', 'other']},
      {'key':'personality',      'options':['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                                            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']}];

    angular.forEach($scope.filterChoices, function(filter){
      var options = [];
      for(var i = 0; i < filter.options.length; i++){
        var temp = {key: filter.options[i], value: false};
        options.push(temp);
      }
      filter.options = options;
      filter.value = null;
    });

    angular.forEach($scope.orderby, function(option){
      var options = [];
      for(var i = 0; i < option.options.length; i++){
        var temp = {key: option.options[i], value: false};
        options.push(temp);
      }
      option.options = options;
      option.value = null;
    });
    $scope.orderby[0]['options'][0].value = true;

    $scope.filters = [$scope.filterChoices[1]];
    for(var i in $scope.filters[0].options){
      // set distance to 25 mi by default
      $scope.filters[0].options[1].value = true;
    }

    $scope.getOrderby = function(){
      var option = $scope.orderby[0]['options'].filter(function(item){
        return item.value;
      });
      return option[0] ? option[0].key : '';
    };

    $scope.getFilterStr = function(options){
      var list = [];
      options.map(function(item){
        if(item.value){
          list.push(item.key);
        }
      });
      return list.toString();
    };

    // semantic breaks angular binding on checkbox inputs, this should make you
    // appreciate how awesome/convenient angular is!
    $scope.checkboxClicked = function(obj, key, option){
      if((option === 'mutual friends' ||
          option === '3rd degree' ||
          option === '4th degree' ||
          option === '5th degree' ||
          option === '6th degree' ||
          option === '7th degree') &&
          $scope.currentUser.role === 'free'){
        return;
      }
      for(var i in $scope[obj]){
        if($scope[obj][i].key === key){
          for(var j in $scope[obj][i]){
            if($scope[obj][i][j] === key){
              for(var k in $scope[obj][i].options){
                if($scope[obj][i].options[k].key === option){
                  $scope[obj][i].options[k].value = !$scope[obj][i].options[k].value;
                }
                // options that are mutually exclusive
                else if (key === 'distance' || key === 'orderby' || key === 'last online' || key === 'connection'){
                  $scope[obj][i].options[k].value = false;
                }
              }
            }
          }
        }
      }
    };

    $scope.loading = false;
    $scope.loadMoreUsers = function(){
      User.find($scope.$parent.usersPageFilters, function(users){
        if(users.length){
          angular.forEach(users, function(item){
            $scope.$parent.users.push(item);
          });
          $scope.$parent.usersPageFilters.page++;

          setTimeout(function(){
            $('.intro-wrapper').flowtype({
             minimum   : 250,
             maximum   : 800,
             minFont   : 10,
             maxFont   : 72,
             fontRatio : 25
            });
          }, 1);
        }
        $scope.loading = false;
      });
    };

    $scope.previousPage = function(){
      $scope.startIndex -= 30;
      $scope.scrollTop();
    };

    $scope.nextPage = function(){
      $scope.scrollTop();
      $scope.loading = true;
      $scope.startIndex += 30;
      $scope.loadMoreUsers();
    };

    $scope.find = function(){
      $('.ui.find.button').addClass('loading');
      var findFilters = {};
      findFilters.details = {};
      $scope.filters.map(function(filter){
        for(var i in filter.options){
          var key = filter.options[i].key;
          var val = filter.options[i].value;
          if(val === true){
            if(filter.key === 'meetup.com' || filter.key === 'activities'){
              findFilters[filter.key] = true;
            } else {
              if(!findFilters.details[filter.key]){
                findFilters.details[filter.key] = [];
              }
              findFilters.details[filter.key].push(key);
            }
          }
        }
      });
      if($scope.tags.list.length){
        findFilters['tags'] = $scope.tags.list.toString();
      }
      if($scope.ageRange.val.length){
        findFilters.ageRange = {};
        findFilters.ageRange.min = $scope.ageRange.val.split('-')[0];
        findFilters.ageRange.max = $scope.ageRange.val.split('-')[1];
        if(!findFilters.ageRange.min || !findFilters.ageRange.max){
          alert('invalid syntax for age range filter');
          $('.ui.find.button').removeClass('loading');
          return;
        }
      }
      angular.forEach($scope.orderby[0].options, function(item){
        if(item.value === true){
          findFilters['sort'] = item.key;
        }
      });

      findFilters.page = 0;
      $scope.$parent.usersPageFilters = findFilters;
      User.find(findFilters, function(users){
        $scope.$parent.users = users;
        $scope.startIndex = 0;
        $('.ui.find.button').removeClass('loading');
        setTimeout(function(){
          $('.intro-wrapper').flowtype({
           minimum   : 250,
           maximum   : 800,
           minFont   : 10,
           maxFont   : 72,
           fontRatio : 25
          });
        }, 1);
        $('.popup.icon').popup({on: 'click'});
        $('.popup.icon').click(function(e){
          e.stopPropagation();
        });
        $scope.$parent.showSideDiv = false;
        $scope.$parent.usersPageFilters.page++;
        $scope.loadMoreUsers();
      });
    };

    // initialize a list of just the filter names for display
    $scope.filterNames = [];
    angular.forEach($scope.filterChoices, function(filter){
      if(filter.key != 'distance' ){
        $scope.filterNames.push(filter.key);
      }
    });
    $scope.filterNames.push('age range');
    $scope.filterNames.sort();

    $scope.chooseFilter = false;

    $scope.showChoices = function(){
      $scope.chooseFilter = !$scope.chooseFilter
      $('.ui.accordion').accordion('close others');
    };

    $scope.hideTags = function(){
      $scope.showTags = false;
      $('#keywords-input').val('');
      $scope.tags.list = [];
      $scope.filterNames.push('keywords');
    };

    $scope.hideAgeRange = function(){
      $scope.showAgeRange = false;
      $('#age-range-input').val('');
      $scope.ageRange = '';
      $scope.filterNames.push('age range');
    };

    $scope.addFilter = function(name){
      if(name === 'keywords'){
        $scope.showTags = true;
        var index = $scope.filterNames.indexOf(name);
        $scope.filterNames.splice(index, 1);
        $scope.chooseFilter = !$scope.chooseFilter;
        return;
      }
      if(name === 'age range'){
        $scope.showAgeRange = true;
        var index = $scope.filterNames.indexOf(name);
        $scope.filterNames.splice(index, 1);
        $scope.chooseFilter = !$scope.chooseFilter;
        return;
      }
      angular.forEach($scope.filterChoices, function(filter){
        if(filter.key === name){
          $scope.filters.push(filter);
          var index = $scope.filterNames.indexOf(name);
          $scope.filterNames.splice(index, 1);
        }
      });
      $scope.chooseFilter = !$scope.chooseFilter;
    };

    $scope.removeFilter = function(key){
      angular.forEach($scope.filters, function(filter, index){
        if(key === filter.key){
          $scope.filters.splice(index, 1);
          $scope.filterNames.push(key);
          $scope.filterNames.sort();
        }
      });
    };

    $scope.birthdayToAge = function(birthday){
      // moment.js is one of the best js libs ever!
      return moment().diff(birthday, 'years');
    };

    $scope.closeModals = function(){
      $('.ui.modal').modal('hide');
    };

    $scope.isMobile = function(){
      return $window.isMobile;
    };

    $scope.scrollTop = function(){
      $('#grid-container').scrollTop(0);
    };

    $scope.isTriple = function(i){
      return (i === 0) || (i % 3 === 0);
    };
    $scope.isDouble = function(i){
      return (i === 0) || (i % 2 === 0);
    };
    $scope.isTooSmall = function(){
      return window.innerWidth < 992;
    };

    $scope.showRightSide = function(){
      if(!$scope.$parent.showSideDiv){
        return true;
      } else if ($scope.isMobile()){
        return false;
      } else {
        return true;
      }
    };

    $scope.toggleSideDiv = function(){
      $scope.$parent.showSideDiv = !$scope.$parent.showSideDiv;
      setTimeout(function(){
        // hacky, for line 28 of findfriends.html TODO
        $('.intro-wrapper').trunk8({lines:4, tooltip:false});
        $scope.$apply(function(){});
        $('.intro-wrapper').flowtype({
         minimum   : 250,
         maximum   : 800,
         minFont   : 10,
         maxFont   : 72,
         fontRatio : 25
        });
        $('.middle').flowtype({
         minimum   : 80,
         maximum   : 700,
         minFont   : 12,
         maxFont   : 150,
         fontRatio : 14
        });
      }, 1);
    };

    $('#right-rail').hide();
    $('#grid-container').on('scroll', function(e){
      $scope.updateScroll();
    });

    $scope.updateScroll = function(){
      if($scope.$parent.showSideDiv){
        return;
      }
      if($('#grid-container').scrollTop() > 400){
        $('#right-rail').show();
      } else{
        $('#right-rail').hide();
      }
    };

    $scope.makeHalf = function(){
      return $('.two.column.row').width() > 450;
    };

    $scope.doWorkaround = function(){
      return true;
    };

    $scope.isPersonality = function(key){
      if(key === 'personality'){
        $('.popup.icon').popup({on: 'click'});
        $('.popup.icon').click(function(e){
          e.stopPropagation();
        });
        return true;
      }
    };

    $scope.isLockedFilter = function(key){
      if((key === 'mutual friends' ||
          key === '3rd degree') &&
          $scope.currentUser.role === 'free'){
        return true;
      }
    };

    $scope.lockedClicked = function(type){
      $('.lock.popup.icon').popup({on: 'click'});
      $('.lock.popup.icon').click(function(e){
        e.stopPropagation();
      });
      if(type === 'degree'){
        $('.lock.popup.icon.degree').popup('show');
      } else {
        $('.lock.popup.icon.mutual').popup('show');
      }
      setTimeout(function(){
        FB.XFBML.parse();
        $('#fb-share-btn').click(function(){
          $scope.facebookShare();
        });
        $('#fb-invite-btn').click(function(){
          $scope.facebookInvite();
        });
      }, 1);
    };

    $scope.facebookShare = function(){
      //TODO: will this work with v2.0?
      FB.ui(
      {
        method        : 'feed',
        display       : 'iframe',
        name          : 'friendfinder.io',
        link          : 'https://friendfinder.io',
        picture       : 'http://friendfinder.io/assets/images/friendfinderMobileLogo.png',
        caption       : 'Meet cool people. Do fun things.',
        description   : 'A new website to help you meet new people through your facebook friends, and do the things you want to.'
      },
      function(response) {
        if (response && response.post_id) {
          User.update({role: 'paid'}).$promise.then(function(res){
            if(!res[0] === 1){
              alert('failed to update your profile, please email support@friendfinder.io'+
                'or try refreshing and sharing again. (you can delete the second post afterwards)');
            } else{
              $scope.currentUser = Auth.getCurrentUser();
              $scope.currentUser.role = 'paid';
            }
          });
        } else {
          // do not unlock
        }
      });
    };

    $scope.facebookInvite = function(){
      //TODO: will this work with v2.0?
      FB.ui(
      {
        method        : 'apprequests',
        message       : 'Check out this awesome new website I just discovered!'
      },
      function(response) {
      });
    };

    $scope.prettyDate = function(dateStr){
      return moment(dateStr).format('ll');
    };

    $scope.kmToMiles = function(km){
      return Math.floor(km*0.62137);
    };

    $scope.$on('onRepeatLast', function(scope, element, attrs){
      $scope.$apply(function(){});
      setTimeout(function(){
        $('.intro-wrapper').flowtype({
         minimum   : 250,
         maximum   : 800,
         minFont   : 10,
         maxFont   : 72,
         fontRatio : 25
        });
        $('.middle').flowtype({
         minimum   : 80,
         maximum   : 700,
         minFont   : 12,
         maxFont   : 150,
         fontRatio : 14
        });
      }, 1);
    });

  });
