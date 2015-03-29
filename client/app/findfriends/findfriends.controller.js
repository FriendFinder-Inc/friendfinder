'use strict';

angular.module('friendfinderApp')
  .controller('FindFriendsCtrl', function ($scope, $http, $window, Auth, User, Message) {

    $scope.showFilterAccordion = true;

    $scope.linkModal = function() {
      $('.ui.modal').modal({allowMultiple: true});
      //TODO: why does profile modal dissapear after we select message area?
      $('.ui.modal.message').modal('attach events', '.modal.profile .button.message');
      $('#mutual-likes-container').flowtype({
         minimum   : 500,
         maximum   : 1200,
         minFont   : 12,
         maxFont   : 40,
         fontRatio : 30
      });
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
                      'shared interests', 'mutual friends',
                      'degrees of separation']}];

    $scope.filterChoices =
     [{'key':'gender',           'options':['male', 'female', 'other']},
      {'key':'distance',         'options':['5mi', '25mi', '100mi', 'anywhere']},
      {'key':'orientation',      'options':['hetero', 'homo', 'bi', 'other']},
      {'key':'last online',      'options':['online now', 'past week', 'past month']},
      {'key':'smokes',           'options':['never', 'occassionally', 'often']},
      {'key':'meetup.com',       'options':['member of same group(s)']},
      {'key':'drinks',           'options':['never', 'occassionally', 'often']},
      {'key':'drugs',            'options':['never', 'occassionally', 'often']},
      {'key':'education',        'options':['some highschool', 'highschool', 'some college', 'associates',
        'bachelors', 'masters', 'doctorate']},
      {'key':'diet',             'options':['vegan', 'vegetarian', 'anything', 'Halal', 'Kosher', 'other']},
      {'key':'job',              'options':['service', 'tech']},
      {'key':'religion',         'options':['christian', 'hindu', 'jewish', 'muslim', 'buddhist', 'atheist',
        'agnostic', 'spiritual but not religious', 'other']},
      {'key':'politics',         'options':['republican', 'democrat', 'independent', 'libertarian', 'other']},
      {'key':'relationship',     'options':['single', 'not single']},
      // {'key':'height',           'options':["<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
      //   "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"]},
      {'key':'cliche',           'options':['hipster', 'yuppie']},
      {'key':'ethnicity',        'options':['white', 'black', 'hispanic/latin', 'asian', 'indian', 'middle eastern',
        'native american', 'pacific islander', 'other']},
      {'key':'personality type', 'options':['INTJ', 'INTP', 'INFJ', 'INFP',
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

    $scope.getOrderby = function(){
      var option = $scope.orderby[0]['options'].filter(function(item){
        return item.value;
      });
      return option[0].key;
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
    // appreciate how awesome+convenient angular is!
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
                else if (key === 'distance' || key === 'orderby' || key === 'last online'){
                  $scope[obj][i].options[k].value = false;
                }
              }
            }
          }
        }
      }
    };

    $scope.find = function(){

      var findFilters = {};
      $scope.filters.map(function(filter){
        for(var i in filter.options){
          var key = filter.options[i].key;
          var val = filter.options[i].value;
          if(val === true){
            findFilters['details.'+filter.key] ?
              findFilters['details.'+filter.key].push(key) :
              findFilters['details.'+filter.key] = [key];
          }
        }
      });
      if($scope.tags.list.length){
        findFilters['tags'] = $scope.tags.list.toString();
      }
      User.find(findFilters, function(users){
        $scope.users = users;
      });
    }

    // initial query
    Auth.getCurrentUser()
    .$promise.then(function(user){
      $scope.currentUser = user;
      $scope.filters = [$scope.filterChoices[1]];
      for(var i in $scope.filters[0].options){
        // set distance to 25 mi by default
        $scope.filters[0].options[1].value = true;
      }
      $scope.find();
    });

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

    $scope.showProfileModal = function(user){
      $scope.selectedUser = user;
      $('.ui.modal.profile').modal('show');
      $scope.getFacebookPhotos(user);
      $scope.getMutualInterests(user);
      // get meetup TODO
      // get shortest path
    };

    $scope.bookmarkUser = function(user){
      var data = {
        rid: user['@rid']
      };
      User.bookmark(data).$promise.then(function(bookmarks){
        // User.bookmarks().$promise.then(function(all){
        // });
      });
    };

    $scope.getMutualInterests = function(user){
      $scope.mutualInterests = [];
      var users = {
        userA: $scope.currentUser.facebookId,
        userB: user.facebookId
      };
      User.mutualinterests(users).$promise.then(function(mutual){
        var token = {
          access_token: $scope.currentUser.fbAccessToken
        };
        var len = 0;
        angular.forEach(mutual, function(like){
          FB.api('/'+like.id, token,function(res){
            FB.api('/'+like.id+'/picture', token,function(img){
              $scope.mutualInterests.push({
                name: res.name,
                link: res.link,
                img: img.data.url
              });
              len++;
              if(len === mutual.length){
                var html = '';
                angular.forEach($scope.mutualInterests, function(item){
                  //TODO: flowtype.js
                  html += "<div style='width:100px; float: left;'><a href="+item.link+" target='_blank'><img style='margin: 3px; width; 100px; height: 100px;' src="+item.img+" ></a><div style=''>"+item.name+"</div></div>"
                })
                $('#mutual-likes-container').html(html);
                console.log('hi', $scope.mutualInterests)
              }
            });
          });
        });
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
      var message = $('#message-text').val();
      var data =  {
                    to: $scope.selectedUser['@rid'],
                    toEmail: $scope.selectedUser.email,
                    from: $scope.currentUser['@rid'],
                    fromEmail: $scope.currentUser.email,
                    timeSent: new Date(),
                    timeRead: null,
                    content: message,
                    toFacebookId: $scope.selectedUser.facebookId,
                    fromFacebookId: $scope.currentUser.facebookId
                  };

      Message.send(data).$promise.then(function(res){
        Message.get({userId: $scope.currentUser.facebookId}).$promise.then(function(messages){
          //TODO: retrieve messages
          console.log('got messages', messages);
        });
      });
    };

    $scope.birthdayToAge = function(birthday){
      // moment.js is one of the best js libs ever!
      return moment().diff(birthday, 'years');
    };

    $scope.closeModals = function(){
      $('.ui.modal').modal('hide all');
    };

    $scope.isMobile = function(){
      if($window.isMobile){
        $scope.showFilterAccordion = false;
      } else {
        $scope.showFilterAccordion = true;
      }
      return $window.isMobile;
    };

    $scope.scrollTop = function(){
      $('#grid-container').scrollTop(0);
    };

    $scope.showSideDiv = true;
    $scope.toggleSideDiv = function(){
      $showSideDiv = !$scope.showSideDiv;
    };

  });
