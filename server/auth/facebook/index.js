'use strict';

var User = require('../../api/user/user.model');
var NrUser = require('../../api/nr-user/nruser.model');
var Page = require('../../api/page/page.model');
var FB = require('fbgraph');

exports.connectFacebook = function(facebookId, accessToken, done){
  User.findOne({
    'facebookId': facebookId
  },
  function(user) {
    if (!user) {
      FB.setAccessToken(accessToken);
      FB.get('/me', function (err, res) {
        if(err) {
          console.log('FB API ERROR: failed to get fb info for user: ', facebookId, err);
          return;
        }
        var fbData = {};
        // optional data
        try{
          fbData.location = {
            name: res.location.name,
            lat: null,
            long: null
          };
        } catch(err) {
          fbData.location = {
            name: null,
            lat: null,
            long: null
          };
        }
        try{fbData.employer = res.work[0].employer.name;} catch(err) {fbData.employer = '-';}
        try{fbData.hometown = res.hometown.name;} catch(err) {fbData.hometown = '-';}
        try{fbData.school   = res.education[res.education.length-1].school.name;} catch(err) {fbData.school = '-';}
        // nonoptional data
        fbData.gender = res.gender;
        fbData.name = res.name;
        fbData.id = res.id;
        fbData.email = res.email;
        fbData.accessToken = accessToken;
        fbData.birthday = new Date(res.birthday.split('/')[2],
                                   res.birthday.split('/')[0]-1,
                                   res.birthday.split('/')[1]);

        if(fbData.location.name){
          FB.get('/'+res.location.id, function (err, res) {
            if(err){
              console.log('FB API ERROR: failed to get lat/long for user: ', res.id, err);
            }
            else {
              fbData.location = {
                name: fbData.location.name,
                lat: res.location.latitude,
                long: res.location.longitude
              };
            }
            newUser(fbData, done);
          });
        } else {
          newUser(fbData, done);
        }
      }); // end FB.get('/me')
    } else {
      //console.log('update time') //TODO when to update lastOnline?
      return done(user);
    }
  });
};

var newUser = function(fbData, cb){
  var user = new User({
    details:{
      cliche:             {value: '-', private: false},
      diet:               {value: '-', private: false},
      drinks:             {value: '-', private: false},
      drugs:              {value: '-', private: false},
      education:          {value: '-', private: false},
      employer:           {value: fbData.employer, private: false},
      ethnicity:          {value: '-', private: false},
      gender:             {value: fbData.gender||'-', private: false},
      height:             {value: '-', private: false},
      hometown:           {value: fbData.hometown, private: false},
      job:                {value: '-', private: false},
      orientation:        {value: '-', private: false},
      personality:        {value: '-', private: false},
      politics:           {value: '-', private: false},
      relationship:       {value: '-', private: false},
      religion:           {value: '-', private: false},
      school:             {value: fbData.school, private: false},
      smokes:             {value: '-', private: false}
    },
    name: fbData.name,
    email: fbData.email,
    location: fbData.location,
    birthday: fbData.birthday,
    fbAccessToken: fbData.accessToken, //TODO: logout? delete?
    facebookId: fbData.id,
    preferences: {
      email: {
        whenMessaged: true,
        activityRequest: true,
        activityInvite: true,
        weeklyMatch: true
      },
      privacy: {
        hiddenFromFriends: false
      }
    },
    profile: {
      intro: "intro test",
      idealWeekend: "ideal test",
      dreamDestination: "dream test"
    },
    role: 'free',
    views: 0,
    created: new Date(),
    lastOnline: new Date()
  });
  user.create(function(user) {
    exports.connectFriends(user);
    exports.connectPages(user);
    exports.uploadFbPhotos(user);
    return cb(user);
  });
};

var createEdge = function(from, to, type){
  var fromRid = '#'+from['@rid'].cluster+':'+from['@rid'].position;
  var toRid = '#'+to['@rid'].cluster+':'+to['@rid'].position;
  db.create('EDGE', type)
  .from(fromRid)
  .to(toRid)
  .one()
  .then(function (edge) {
  })
  .catch(function(err){
    var msg = 'ORIENTDB ERRO: failed to create edge, '+err.message;
    console.log(msg);
  });
};

// TODO: before April 30th 2015 this will need to be refactored
// as we will no longer have access to non registered users
exports.connectFriends = function(user){
  FB.get('/me/friends', function (err, res) {
    if(err) {
      console.log('FB API ERROR: failed to get friends for user: ', user.facebookId, err);
      return;
    }
    var recurse = function(res){
      for(var i =0; i < res.data.length; i++){
        var friend = res.data[i];
        (function(friend){
          NrUser.findOne({id: friend.id}, function(foundFriend){
            if(!foundFriend){
              var newFriend = new NrUser({
                name: friend.name,
                id: friend.id
              });
              newFriend.create(function(createdFriend){
                createEdge(user, createdFriend, 'friends');
              });
            } else{
              createEdge(user, foundFriend, 'friends');
            }
          });
        })(friend);
      }
      // keep asynchronously paging data
      if(res.paging && res.paging.next){
        FB.get(res.paging.next, function(err, response){
          if(err) {
            console.log('FB API ERROR: failed to get friends for user:', user.facebookId, err);
            return;
          }
          recurse(response);
        });
      }
    };
    recurse(res);
  });
};

// create and/or link all fb pages a user likes
exports.connectPages = function(user){
  FB.get('/me/likes', {limit: 100}, function (err, res) {
    if(err) {
      console.log('FB API ERROR: failed to get likes for user:', user.facebookId, err);
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
            console.log('FB API ERROR: failed to get likes for user:', user.facebookId, err);
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
      console.log('FB API ERROR: failed to get albums for user:', user.facebookId, err);
      return;
    }
    for(var i = 0; i < albums.data.length; i++){
      if(albums.data[i].name === 'Profile Pictures'){
        var profileAlbum = albums.data[i].id;
      }
    }
    if(!profileAlbum){
      console.log("FB API ERROR: no 'Profile Pictures' album exists for user:", user.facebookId);
      return;
    }
    FB.get('/'+profileAlbum+'/photos', {limit: 8}, function (err, photos) {
      if(err) {
        console.log('FB API ERROR: failed to get profile photos for user:', user.facebookId, err);
        return;
      }
      //upload first 8 pics to cloudinary
      for(var i = 0; i < photos.data.length; i++){
        cloudinary.uploader.upload(
          photos.data[i].source,
          function(result) { },
          {
            public_id: user.facebookId+'/'+i,
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
