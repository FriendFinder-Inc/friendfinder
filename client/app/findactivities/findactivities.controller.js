'use strict';

angular.module('friendfinderApp')
  .controller('FindActivitiesCtrl', function ($scope, $http, Auth, User, Message) {
    $('.ui.accordion').accordion();
    // initialize all modals
    $('.ui.modal').modal({allowMultiple: true});
    // open message modal on message button click
    //TODO: why does profile modal dissapear after we select message area?
    $('.ui.modal.message').modal('attach events', '.modal.profile .button.message');
    //$('.ui.checkbox').checkbox();

    $('#send-message-btn').click(function(){
      $scope.sendMessage();
      $scope.closeModals();
    });

    $('#cancel-message-btn').click(function(){
      $scope.closeModals();
    });

    $scope.filterChoices =
     [{'key':'gender',           'options':['male', 'female', 'other']},
      {'key':'distance',         'options':['5mi', '25mi', '100mi', 'anywhere']},
      {'key':'-ORDER BY',        'options':[ 'distance', 'last online']}, //'mutual interests', 'degrees of seperation']},
      {'key':'orientation',      'options':['hetero', 'homo', 'bi', 'other']},
      {'key':'last online',      'options':['time1', 'time2']},
      {'key':'smokes',           'options':['never', 'occassionally', 'often']},
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
      {'key':'height',           'options':["<5'0''", "5'0''", "5'1''", "5'2''", "5'3''", "5'4''", "5'5''",
        "5'6''", "5'7''", "5'8''", "5'9''", "5'10''", "5'11''", "6'0''", "6'1''", "6'2''", "6'3''", ">6'4''"]},
      {'key':'cliche',           'options':['hipster', 'yuppie']},
      {'key':'ethnicity',        'options':['white', 'black', 'hispanic/latin', 'asian', 'indian', 'eastern',
        'native american', 'pacific islander', 'other']},
      {'key':'personality type', 'options':['INTJ', 'INTP', 'INFJ', 'INFP',
                                            'ISFJ', 'ISFP', 'ISTJ', 'ISTP']}];

    angular.forEach($scope.filterChoices, function(filter){
      var options = [];
      for(var i = 0; i < filter.options.length; i++){
        var temp = {name: filter.options[i], value: false};
        options.push(temp);
      }
      filter.options = options;
      filter.value = null;
    });

    // poor man's 2 way data binding...TODO
    // can't use ng-model with semantic ui checkboxes
    $scope.toggleOption = function(filter, option){
      $('.ui.checkbox.'+filter+'.'+option).checkbox('toggle');
    };

    $scope.find = function(){
      // split into two arrays for easy two column layout
      // TODO: on mobile the columns should interleave to
      // preserve order
      $scope.evenUsers = [];
      $scope.oddUsers = [];

      var findFilters = {};
      $scope.filters.map(function(filter){
        for(var i in filter.options){
          var key = filter.options[i].name;
          var val = filter.options[i].value;
          if(val === true){
            findFilters['details.'+filter.key] ?
              findFilters['details.'+filter.key].push(key) :
              findFilters['details.'+filter.key] = [key];
          }
        }
      });
      User.find(findFilters, function(users){
        angular.forEach(users, function(user, index){
          index%2 ? $scope.evenUsers.push(user) : $scope.oddUsers.push(user);
        });
      });
    }

    // initial query
    Auth.getCurrentUser()
    .$promise.then(function(user){
      $scope.currentUser = user;
      $scope.filters = $scope.filterChoices.slice(0, 2);
      for(var i in $scope.filters[0].options){
        // set gender to be same as user's
        for(var key in $scope.filters[0].options[i]){
          var gender = $scope.filters[0].options[i][key];
          if(gender === user.details.gender.value){
            $scope.filters[0].options[i].value = true;
          }
        }
        // set distance to 25 mi by default
        $scope.filters[1].options[1].value = true;
      }
      $scope.find();
    });

    // initialize a list of just the filter names for display
    $scope.filterNames = [];
    angular.forEach($scope.filterChoices, function(filter){
      if(filter.key != 'gender' && filter.key != 'distance'){
        $scope.filterNames.push(filter.key);
      }
    });
    $scope.filterNames.sort();

    $scope.chooseFilter = false;

    $scope.addFilter = function(name){
      angular.forEach($scope.filterChoices, function(filter){
        if(filter.key === name){
          $scope.filters.push(filter);
          var index = $scope.filterNames.indexOf(name);
          $scope.filterNames.splice(index, 1);
        }
      });
      // TODO: close others while choosing
      //$('.ui.accordion').accordion('close others');
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
    };

    $scope.bookmarkUser = function(user){
      console.log('bookmarking', user['@rid'])
      var data = {
        rid: user['@rid']
      };
      User.bookmark(data).$promise.then(function(bookmarks){
        User.bookmarks().$promise.then(function(all){
          console.log('a', all)
        })
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
                  html += "<div style='width:100px; float: left;'><a href="+item.link+" target='_blank'><img style='margin: 3px; width; 100px; height: 100px;' src="+item.img+" ></a><div style='float: left; width: 100%; overflow: hidden;'>"+item.name+"</div></div>"
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
                    from: $scope.currentUser['@rid'],
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

  });