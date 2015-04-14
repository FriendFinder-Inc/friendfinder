'use strict';

angular.module('friendfinderApp')
  .controller('FindActivitiesCtrl', function ($scope, $http, $window, Auth, User, Activity, Message, Bookmarks, Profile) {

    $(window).load(function() {
      setTimeout(function(){
        $('.activity-title').textfill({});
        $('.activity-date').textfill({});
        $('.activity-location').textfill({});
        $('.popup.icon').popup({on: 'click'});
        $('.popup.icon').click(function(e){
          e.stopPropagation();
        });
      }, 1);
    });

    $scope.$on('onRepeatLast', function(scope, element, attrs){
      $('.activity-title').textfill({});
      $('.activity-location').textfill({});
    });

    $scope.currentUser = Auth.getCurrentUser();

    $scope.bookmarks = [];
    $scope.requests = [];
    Bookmarks.getBookmarkRids(function(rids){
      $scope.bookmarks = rids;
    });

    User.requests().$promise.then(function(requests){
      angular.forEach(requests, function(item){
        $scope.requests.push(item['@rid']);
      })
    });

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

    $scope.orderby = [{'key':'orderby', 'options':['-', 'distance', 'creation date']}];

    $scope.filterChoices =
     [{'key':'distance',           'options':['5mi', '25mi', '50mi', '100mi', 'anywhere']},
      {'key':'date range',         'options':['start', 'end']},
      {'key':'creation date',      'options':['today', 'this week', 'this month', 'anytime']},
      {'key':'events only',        'options':['true']}];

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

    $scope.filters = [];
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

      // Activity.find(findFilters, function(users){
      Activity.find({}, function(activities){
        $scope.activities = activities;
        console.log('ats', activities)
        $('.ui.find.button').removeClass('loading');
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

    $scope.bookmark = function(item){
      Bookmarks.add(item['@rid'], function(bookmarks){
        Bookmarks.getBookmarkRids(function(rids){
          $scope.bookmarks = rids;
        });
      });
    };

    $scope.isBookmarked = function(rid){
      return ($scope.bookmarks.indexOf(rid) != -1);
    };

    $scope.request = function(item){
      var data = {
        rid: item['@rid'],
        owner: item.creator,
        activityTitle: item.title
      };
      Activity.request(data).$promise.then(function(bookmarks){
        $scope.requests.push(data.rid);
      });
    };

    $scope.alreadyRequested = function(item){
      if(item && $scope.requests.indexOf(item['@rid']) != -1){
        return true;
      } else{
        return false;
      }
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
      return window.innerWidth < 1100;
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

    $scope.showSideDiv = true;
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
      return $('.two.column.row').width() > 510 ||
              ($('.two.column.row').width() > 510 &&
                $('.two.column.row').width() < 1100);
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

    $scope.prettyDate = function(dateStr){
      return moment(dateStr).format('ll');
    };

  });
