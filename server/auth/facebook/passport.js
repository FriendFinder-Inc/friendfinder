var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../../api/user/user.model');
var NrUser = require('../../api/nr-user/nruser.model');
var Page = require('../../api/page/page.model');
var FB = require('fbgraph');

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        'facebook.id': profile.id
      },
      function(user) {
        if (!user) {
          user = new User({
            details:{
              cliche:             {value: '-', private: false},
              diet:               {value: '-', private: false},
              drinks:             {value: '-', private: false},
              drugs:              {value: '-', private: false},
              education:          {value: '-', private: false},
              ethnicity:          {value: '-', private: false},
              gender:             {value: profile.gender||'-', private: false},
              height:             {value: '-', private: false},
              job:                {value: '-', private: false},
              'looking for':      {value: '-', private: false},
              orientation:        {value: '-', private: false},
              'personality type': {value: '-', private: false},
              politics:           {value: profile.political||'-', private: false},
              relationship:       {value: profile.relationship_status||'-', private: false},
              religion:           {value: profile.religion||'-', private: false},
              smokes:             {value: '-', private: false}
            },
            email: profile.emails[0].value,
            facebook: profile._json,
            name: profile.displayName,
            preferences: {
              email: {
                whenMessaged: true,
                weeklyMatch: true
              },
              privacy: {
                hiddenFromFriends: false,
                hiddenFromPublic: false
              }
            },
            profile: {
              intro: 'intro'
            },
            role: 'free'
          });
          user.create(function(user) {
            FB.setAccessToken(accessToken);
            exports.connectFriends(user);
            exports.connectPages(user);
            exports.uploadFbPhotos(user);
            return done(null, user);
          });
        } else {
          return done(null, user);
        }
      });
    }
  ));
};

var createEdge = function(from, to, type){
  var fromRid = '#'+from['@rid'].cluster+':'+from['@rid'].position;
  var toRid = '#'+to['@rid'].cluster+':'+to['@rid'].position;
  db.create('EDGE', type)
  .from(fromRid)
  .to(toRid)
  .one()
  .then(function (edge) {
  });
};

// TODO: before April 30th 2015 this will need to be refactored
// as we will no longer have access to non registered users
exports.connectFriends = function(user){
  FB.get('/me/friends', function (err, res) {
    if(err) {
      console.log('FB API ERROR: failed to get friends for user: ', user.facebook.id);
      return;
    }
    for(var i =0; i < res.data.length; i++){
      var friend = res.data[i];
      (function(friend){
        NrUser.findOne({id: friend.id}, function(foundFriend){
          if(!foundFriend){
            var newUser = new NrUser({
              name: friend.name,
              id: friend.id
            });
            newUser.create(function(createdFriend){
              createEdge(user, createdFriend, 'friends');
            });
          } else {
            createEdge(user, foundFriend, 'friends');
          }
        });
      })(friend);
    }
  });
};

// create and/or link all fb pages a user likes
exports.connectPages = function(user){
  FB.get('/me/likes', {limit: 100}, function (err, res) {
    if(err) {
      console.log('FB API ERROR: failed to get likes for user:', user.facebook.id, err);
      return;
    }
    var recurse = function(res){
      for(var i =0; i < res.data.length; i++){
        var page = res.data[i];
        (function(page){
          Page.findOne({id: page.id}, function(foundPage){
            if(!foundPage){
              var newPage = new Page({
                name: page.name,
                category: page.category,
                id: page.id
              });
              newPage.create(function(createdPage){
                createEdge(user, createdPage, 'likes');
              });
            } else{
              createEdge(user, foundPage, 'likes');
            }
          });
        })(page);
      }
      // keep asynchronously paging data
      if(res.paging && res.paging.next){
        FB.get(res.paging.next, function(err, response){
          if(err) {
            console.log('FB API ERROR: failed to get likes for user:', user.facebook.id, err);
            return;
          }
          recurse(response);
        });
      }
    };
    recurse(res);
  });
};

exports.uploadFbPhotos = function(user){

  FB.get('/me/albums', {limit: 5}, function (err, albums) {
    if(err) {
      console.log('FB API ERROR: failed to get albums for user:', user.facebook.id, err);
      return;
    }
    for(var i = 0; i < albums.data.length; i++){
      if(albums.data[i].name === 'Profile Pictures'){
        var profileAlbum = albums.data[i].id;
      }
    }
    FB.get('/'+profileAlbum+'/photos', {limit: 8}, function (err, photos) {
      if(err) {
        console.log('FB API ERROR: failed to get profile photos for user:', user.facebook.id, err);
        return;
      }
      //upload first 8 pics to cloudinary
      for(var i = 0; i < photos.data.length; i++){
        cloudinary.uploader.upload(
          photos.data[i].source,
          function(result) { },
          {
            public_id: user.facebook.id+'/'+i,
            crop: 'fill',
            width: 720,
            height: 720,
            gravity: 'face',
            format: 'jpg'
          }
        );
      }
    });
  });
};
