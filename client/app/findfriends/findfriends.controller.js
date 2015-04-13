'use strict';

angular.module('friendfinderApp')
  .controller('FindFriendsCtrl', function ($scope, $http, $window, Auth, User, Activity, Message, Bookmarks) {

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
         fontRatio : 12
        });
        $('.popup.icon').popup({on: 'click'});
        $('.popup.icon').click(function(e){
          e.stopPropagation();
        });
      }, 1);
    });

    $scope.currentUser = Auth.getCurrentUser();

    $scope.bookmarks = [];
    Bookmarks.getBookmarkRids(function(rids){
      $scope.bookmarks = rids;
    });

    $scope.linkModal = function() {
      $('.ui.modal').modal({allowMultiple: false});
      $('.ui.modal').modal('setting', 'transition', 'fade');
      $('.ui.modal.message').modal('attach events', '.modal.profile .button.message-btn');
    };

    $scope.linkAccordion = function(){
      $('.ui.accordion').accordion();
    };

    $('#send-message-btn').click(function(){
      $scope.sendMessage();
      $scope.closeModals();
    });

    $('#cancel-message-btn').click(function(){
      $scope.closeModals();
    });

    $scope.tags = {};
    $scope.tags.list = [];
    $scope.showTags = true;

    $scope.orderby = [{'key':'orderby', 'options':['-', 'distance', 'last online',
                      'shared interests', 'mutual friends']}];

    $scope.filterChoices =
     [{'key':'gender',           'options':['male', 'female', 'other']},
      {'key':'distance',         'options':['5mi', '25mi', '50mi', '100mi', 'anywhere']},
      {'key':'orientation',      'options':['hetero', 'homo', 'bi', 'other']},
      {'key':'last online',      'options':['online now', 'past week', 'past month']},
      {'key':'smokes',           'options':['never', 'occassionally', 'often']},
      {'key':'activities',       'options':['has activities']},
      {'key':'meetup.com',       'options':['member of same group(s)']},
      {'key':'drinks',           'options':['never', 'occassionally', 'often']},
      {'key':'connection',       'options':['3rd degree', '4th degree', '5th degree', '6th degree', '7th degree']},
      {'key':'drugs',            'options':['never', 'occassionally', 'often']},
      {'key':'education',        'options':['some highschool', 'highschool', 'some college', 'associates',
        'bachelors', 'masters', 'doctorate']},
      {'key':'diet',             'options':['vegan', 'vegetarian', 'anything', 'Halal', 'Kosher', 'other']},
      {'key':'job',              'options':["Administration", "Art / Music / Writing", "Banking / Finance", "Construction",
                                            "Education", "Entertainment / Media", "Food", "Hospitality", "Law", "Management", "Medicine",
                                            "Military", "Politics / Government", "Retail", "Sales / Marketing", "Science / Engineering",
                                            "Student", "Technology", "Transportation", "other"]},
      {'key':'religion',         'options':['christian', 'hindu', 'jewish', 'muslim', 'buddhist', 'atheist',
        'agnostic', 'spiritual but not religious', 'other']},
      {'key':'politics',         'options':['republican', 'democrat', 'independent', 'libertarian', 'other']},
      {'key':'relationship',     'options':['single', 'not single']},
      // {'key':'height',           'options':["<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
      //   "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"]},
      {'key':'ethnicity',        'options':['white', 'black', 'hispanic/latin', 'asian', 'indian', 'middle eastern',
        'native american', 'pacific islander', 'other']},
      {'key':'personality',      'options':['INTJ', 'INTP', 'INFJ', 'INFP',
                                            'ISFJ', 'ISFP', 'ISTJ', 'ISTP']}];

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
          option === 'degrees of separation') &&
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

    $scope.find = function(){
      $('.ui.find.button').addClass('loading');
      var findFilters = {};
      $scope.filters.map(function(filter){
        for(var i in filter.options){
          var key = filter.options[i].key;
          var val = filter.options[i].value;
          if(val === true){
            if(filter.key === 'meetup.com' || filter.key === 'activities'){
              findFilters[filter.key] = true;
            } else {
              findFilters['details.'+filter.key] ?
                findFilters['details.'+filter.key].push(key) :
                findFilters['details.'+filter.key] = [key];
            }
          }
        }
      });
      if($scope.tags.list.length){
        findFilters['tags'] = $scope.tags.list.toString();
      }

      User.find(findFilters, function(users){
        $scope.users = users;
        console.log('users', users)
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
      });
    }


    // initialize a list of just the filter names for display
    $scope.filterNames = [];
    angular.forEach($scope.filterChoices, function(filter){
      if(filter.key != 'distance' ){
        $scope.filterNames.push(filter.key);
      }
    });
    $scope.filterNames.sort();

    $scope.chooseFilter = false;

    $scope.showChoices = function(){
      $scope.chooseFilter = !$scope.chooseFilter
      $('.ui.accordion').accordion('close others');
    };

    $scope.hideTags = function(){
      $scope.showTags = false;
      $scope.filterNames.push('tags');
    };

    $scope.addFilter = function(name){
      if(name === 'tags'){
        $scope.showTags = true;
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
          //TODO: update filters model as well!
        }
      });
    };

    $scope.bookmarkUser = function(user){
      Bookmarks.add(user['@rid'], function(bookmarks){
        Bookmarks.getBookmarkRids(function(rids){
          $scope.bookmarks = rids;
        });
      });
    };

    $scope.isBookmarked = function(rid){
      return ($scope.bookmarks.indexOf(rid) != -1);
    };

    $scope.showProfileModal = function(user){
      $scope.newUser = true;
      $scope.showAllInterests = false;
      $scope.showMutualFriends = true;
      $scope.showMutualInterests = true;
      $scope.selectedUser = user;
      $('.ui.modal.profile').modal('setting', {
        onVisible: function(){
          // make sure all data is visible
          $('.activity-title').textfill({});
          $('.activity-date').textfill({});
          $('.activity-location').textfill({});
        }
      }).modal('show');
      $scope.getFacebookPhotos(user);
      $scope.getMutualInterests(user);
      $scope.getMutualFriends(user);
      $scope.getMutualMeetups(user);
      $scope.getUsersActivities(user);
    };


    $scope.getMutualInterests = function(user){
      $scope.mutualInterests = {};
      $scope.mutualInterests.pages = [];
      $scope.mutualInterests.tags = [];
      $scope.mutualInterests.meetups = [];
      User.mutualinterests({rid: user['@rid']}).$promise.then(function(mutual){
        var token = {
          access_token: $scope.currentUser.fbAccessToken
        };
        angular.forEach(mutual, function(like){
          if(like['@class'] === 'Page'){
            FB.api('/'+like.id, token,function(res){
              FB.api('/'+like.id+'/picture', token,function(img){
                $scope.mutualInterests.pages.push({
                  name: res.name,
                  link: res.link,
                  img: img.data.url
                });
                $scope.$apply(function(){}); // update for modal
              });
            });
          } else {
            $scope.mutualInterests.tags.push({name: like.name});
          }
        });
      });
    };

    $scope.getMutualFriends = function(user){
      $scope.mutualFriends = [];
      User.mutualfriends({rid: user['@rid']}).$promise.then(function(mutual){
        $scope.mutualFriends = mutual;
        if(!mutual.length){
          $scope.getConnectionPath(user);
        }
      });
    };

    $scope.getMutualMeetups = function(user){
      $scope.mutualMeetups = [];
      User.mutualmeetups({rid: user['@rid']}).$promise.then(function(mutual){
        $scope.mutualMeetups = mutual;
      });
    };

    $scope.getUsersInterests = function(user){
      User.interests({rid: user['@rid']}).$promise.then(function(likes){
        angular.forEach(likes, function(like){
          if(like['@class'] === 'Tag'){
            $scope.allInterests.tags.push(like);
          } else {
            //TODO: show fb likes?
          }
        });
      });
    };

    $scope.getUsersMeetups = function(user){
      User.meetups({rid: user['@rid']}).$promise.then(function(meetups){
        $scope.allInterests.meetups = meetups;
      });
    };

    $scope.getUsersActivities = function(user){
      $scope.usersActivities = [];
      Activity.get({rid: user['@rid']}).$promise.then(function(activities){
        $scope.usersActivities = activities;
      });
    };

    $scope.getConnectionPath = function(user){
      $scope.connectionPath = [];
      User.getConnectionPath({rid: user['@rid']}).$promise.then(function(path){
        $scope.connectionPath = path;
      });
    };

    $scope.getFacebookPhotos = function(user){
      $scope.fbPicsUrls = [];
      for(var i = 0; i < 8; i++){
        var img = $.cloudinary.image(user.facebookId+'/'+i+'.jpg');
        $scope.fbPicsUrls.push(img[0].src);
      }
    };

    $scope.sendMessage = function(){
      var message = $('#message-area-findacts').val();
      var data =  {
                    to: $scope.selectedUser['@rid'],
                    toEmail: $scope.selectedUser.email,
                    toName: $scope.selectedUser.name.split(' ')[0],
                    from: $scope.currentUser['@rid'],
                    fromEmail: $scope.currentUser.email,
                    fromName: $scope.currentUser.name.split(' ')[0],
                    timeSent: new Date(),
                    timeRead: null,
                    content: message,
                    toFacebookId: $scope.selectedUser.facebookId,
                    fromFacebookId: $scope.currentUser.facebookId
                  };

      Message.send(data).$promise.then(function(res){
        $('#message-area-findacts').val('');
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
      if(!$scope.showSideDiv){
        return true;
      } else if ($scope.isMobile()){
        return false;
      } else {
        return true;
      }
    };

    $scope.showSideDiv = false;
    $scope.toggleSideDiv = function(){
      $scope.showSideDiv = !$scope.showSideDiv;
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
         fontRatio : 12
        });
      }, 1);
    };

    $('#right-rail').hide();
    $('#grid-container').on('scroll', function(e){
      $scope.updateScroll();
    });

    $scope.updateScroll = function(){
      if($scope.showSideDiv){
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
          key === 'degrees of separation') &&
          $scope.currentUser.role === 'free'){
        return true;
      }
    };

    $scope.lockedClicked = function(){
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
        picture       : 'http://i.huffpost.com/gen/964776/images/o-CATS-KILL-BILLIONS-facebook.jpg',
        caption       : 'Meet cool people. Do fun things.',
        description   : 'A new website to help you meet new people, through your facebook friends.'
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

    $scope.showMutualInterests = true;
    $scope.toggleMutualInterests = function(){
      $scope.showMutualInterests = !$scope.showMutualInterests;
    };

    $scope.showMutualFriends = true;
    $scope.toggleMutualFriends = function(){
      $scope.showMutualFriends = !$scope.showMutualFriends;
    };

    $scope.showConnectionPath = true;
    $scope.toggleConnectionPath = function(){
      $scope.showConnectionPath = !$scope.showConnectionPath;
    };


    $scope.newUser = true;
    $scope.showAllInterests = false;
    $scope.toggleAllInterests = function(){
      if(!$scope.showAllInterests && $scope.newUser){
        $scope.allInterests = {};
        $scope.allInterests.tags = [];
        $scope.allInterests.meetups = [];
        $scope.getUsersInterests($scope.selectedUser);
        $scope.getUsersMeetups($scope.selectedUser);
        $scope.newUser = false;
      }
      $scope.showAllInterests = !$scope.showAllInterests;
    };

    $scope.prettyDate = function(dateStr){
      return moment(dateStr).format('ll');
    };

  });
